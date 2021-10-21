const express = require('express');
const deezer = require('deezer-js');
const deemix = require('deemix');
const path = require('path');
const { inspect, promisify } = require('util');
const fs = require('fs');
const { exec } = require('child_process');
const timeago = require('timeago.js');

const port = process.env.PORT || 4500;
// const deleteTimer = 1000 * 60 * 60; // 1 hour
const deleteTimer = 1000 * 60 * 25; // 25 minutes
// const deleteTimer = 16000;

require('dotenv').config();

const app = new express();
const expressWs = require('express-ws')(app);
const deezerInstance = new deezer.Deezer();
let deemixDownloader;

let deemixSettings = deemix.settings.DEFAULTS
deemixSettings.downloadLocation = path.join(process.cwd(), 'data/');
deemixSettings.maxBitrate = String(deezer.TrackFormats.FLAC);
deemixSettings.overwriteFile = deemix.settings.OverwriteOption.OVERWRITE;

const toDeleteLocation = './data/toDelete.json';

if (!fs.existsSync(toDeleteLocation)) fs.writeFileSync(toDeleteLocation, '[]', {encoding: 'utf8'});
let toDelete = JSON.parse(fs.readFileSync(toDeleteLocation, {encoding: 'utf8'}));

function updateQueueFile() {
  fs.writeFileSync(toDeleteLocation, JSON.stringify(toDelete), {encoding: 'utf8'});
}

function queueDeletion(file) {
  console.log(`queued deletion of ${file} ${timeago.format(Date.now() + deleteTimer)}`);

  toDelete.push({
    date: Date.now() + deleteTimer,
    file
  });
  setTimeout(() => {
    toDelete = toDelete.filter(c => c.file !== file);
    updateQueueFile();
    console.log(`deleting queued file ${file}`);
    try {
      fs.unlinkSync(file);
    } catch(err) {
      console.log(`failed to delete ${file}! is the file already gone?`);
    }
  }, deleteTimer);
  updateQueueFile();
}

console.log(`loaded ${toDelete.length} items in deletion queue`);
let updateQueue = false;
for (let del of toDelete) {
  if (Date.now() - del.date >= 0) {
    toDelete = toDelete.filter(c => c.file !== del.file);
    console.log(`deleting ${del.file} - was meant to be deleted ${timeago.format(del.date)}`);
    updateQueue = true;
    try {
      fs.unlinkSync(del.file);
    } catch(err) {
      console.log(`failed to delete ${del.file}! is the file already gone?`);
    }
  } else {
    console.log(`queueing deletion of ${del.file} ${timeago.format(del.date)}`);
    setTimeout(() => {
      toDelete = toDelete.filter(c => c.file !== del.file);
      updateQueueFile();
      try {
        fs.unlinkSync(del.file);
      } catch(err) {
        console.log(`failed to delete ${del.file}! is the file already gone?`);
      }
    }, del.date - Date.now());
  }
};

if (updateQueue) {
  updateQueueFile();
  console.log('updated deletion queue json');
}

app.use(express.static('public'));
app.use('/data', express.static('data', {extensions:  ['flac', 'mp3']}));
app.get('/api/search', async (req, res) => {
  if (!req.query.search) return res.sendStatus(400);

  let s = await deezerInstance.api.search_album(req.query.search, {
    limit: 15,
  });

  let format = s.data.map(s => {
    return {
      id: s.id,
      title: s.title,
      cover: s.md5_image,
      artist: {
        id: s.artist.id,
        name: s.artist.name
      },
    };
  });

  res.send(format);
});

app.get('/api/album', async (req, res) => {
  if (!req.query.id) return req.sendStatus(400);
  let album;
  try {
    album = await deezerInstance.api.get_album(req.query.id);
  } catch (err) {
    return req.status(404).send('Album not found!');
  }
  res.send({
    id: album.id,
    title: album.title,
    link: album.link,
    tracks: album.tracks.data.map(t => {
      return {
        id: t.id,
        title: t.title,
        duration: t.duration,
        link: t.link,
        artist: t.artist.name,
      };
    })
  });
});

app.ws('/api/album', async (ws, req) => {
  if (!req.query.id) return ws.close(1008, 'Supply a track ID in the query!');

  let trackpaths = [];

  const listener = {
    send(key, data) {
      if (data.downloaded) {
        // ws.send(JSON.stringify({key: 'download', data: data.downloadPath.replace(process.cwd(), '')}));
        trackpaths.push(data.downloadPath);
        queueDeletion(data.downloadPath);
      }

      if (data.state !== 'tagging' && data.state !== 'getAlbumArt' && data.state !== 'getTags') ws.send(JSON.stringify({key, data}));
      //console.log(`[${key}] ${inspect(data)}`);
    }
  };

  let album;
  try {
    album = await deezerInstance.api.get_album(req.query.id);
  } catch(err) {
    return ws.close(1012, 'Album not found');
  }

  listener.send('coverArt', album.cover_medium);
  listener.send('metadata', {id: album.id, title: album.title, artist: album.artist.name});

  let dlObj = await deemix.generateDownloadObject(deezerInstance, 'https://www.deezer.com/album/' + req.query.id, deezer.TrackFormats.FLAC);
  deemixDownloader = new deemix.downloader.Downloader(deezerInstance, dlObj, deemixSettings, listener);

  await deemixDownloader.start();

  if (trackpaths.length > 1) {
    await ws.send(JSON.stringify({key: 'zipping'}));

    const folderName = trackpaths[0].split('/').slice(-2)[0];
    try {
      await promisify(exec)(`zip -0rD "data/${folderName}.zip" "data/${folderName}"`);
    } catch(err) {
      return ws.close(1011, 'Zipping album failed');
    }
  
    await ws.send(JSON.stringify({key: 'download', data: `data/${folderName}.zip`}));
  
    queueDeletion('./data/' + folderName + '.zip');
  } else {
    await ws.send(JSON.stringify({key: 'download', data: trackpaths[0].replace(process.cwd(), '')}));
  }

  ws.close(1000);
});

app.ws('/api/track', async (ws, req) => {
  if (!req.query.id) return ws.close(1008, 'Supply a track ID in the query!');

  const listener = {
    send(key, data) {
      if (data.downloaded) {
        ws.send(JSON.stringify({key: 'download', data: data.downloadPath.replace(process.cwd(), '')}));
        queueDeletion(data.downloadPath);
      }

      if (data.state !== 'tagging' && data.state !== 'getAlbumArt' && data.state !== 'getTags') ws.send(JSON.stringify({key, data}));
      //console.log(`[${key}] ${inspect(data)}`);
    }
  };

  let track;
  try {
    track = await deezerInstance.api.get_track(req.query.id);
  } catch(err) {
    return ws.close(1012, 'Track not found');
  }

  listener.send('coverArt', track.album.cover_medium);
  listener.send('metadata', {id: track.id, title: track.title, artist: track.artist.name});

  let dlObj = await deemix.generateDownloadObject(deezerInstance, 'https://www.deezer.com/track/' + req.query.id, deezer.TrackFormats.FLAC);
  deemixDownloader = new deemix.downloader.Downloader(deezerInstance, dlObj, deemixSettings, listener);

  await deemixDownloader.start();

  ws.close(1000);
});

deezerInstance.login_via_arl(process.env.DEEZER_ARL).then(() => {
  console.log('logged into deezer');
  app.listen(port, () => {
    console.log('hosting on ' + port);
  });
});
