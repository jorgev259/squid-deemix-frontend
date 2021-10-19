const express = require('express');
const deezer = require('deezer-js');
const deemix = require('deemix');
const path = require('path');
const { inspect } = require('util');
const ws = require('ws');
const fs = require('fs');

const port = process.env.PORT || 4500;

require('dotenv').config();

const app = new express();
const expressWs = require('express-ws')(app);
const deezerInstance = new deezer.Deezer();
let deemixDownloader;

let deemixSettings = deemix.settings.DEFAULTS
deemixSettings.downloadLocation = path.join(process.cwd(), 'data/');
deemixSettings.maxBitrate = String(deezer.TrackFormats.FLAC);
deemixSettings.overwriteFile = deemix.settings.OverwriteOption.OVERWRITE;

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

/*
app.get('/api/album', async (req, res) => {
  if (!req.query.id) return res.sendStatus(400);
  let dlObj = await deemix.generateDownloadObject(deezerInstance, 'https://www.deezer.com/album/' + req.query.id, deezer.TrackFormats.FLAC);
  deemixDownloader = new deemix.downloader.Downloader(deezerInstance, dlObj, deemixSettings, listener);

  console.log(await deemixDownloader.start());

  res.send('a');
});
*/

app.get('/api/album', async (req, res) => {
  if (!req.query.id) return req.sendStatus(400);
  const album = await deezerInstance.api.get_album(req.query.id);
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
  if (!req.query.id) return ws.close();

  const listener = {
    send(key, data) {
      if (data.downloaded) {
        ws.send(JSON.stringify({key: 'download', data: data.downloadPath.replace(process.cwd(), '')}));
        console.log('downloaded ' + data.downloadPath + ', deleting in 1hr')
        setTimeout(() => {
          try {
            fs.unlinkSync(data.downloadPath);
          } catch(err) {
            console.log('tried to delete ' + data.downloadPath + ', but failed? its likely already gone')
          }
        }, 1000 * 60 * 60 /* 1 hour */);
      }

      ws.send(JSON.stringify({key, data}));
      //console.log(`[${key}] ${inspect(data)}`);
    }
  };

  let album;
  try {
    album = await deezerInstance.api.get_album(req.query.id);
  } catch(err) {
    return ws.close();
  }

  listener.send('coverArt', album.cover_medium);

  let dlObj = await deemix.generateDownloadObject(deezerInstance, 'https://www.deezer.com/album/' + req.query.id, deezer.TrackFormats.FLAC);
  deemixDownloader = new deemix.downloader.Downloader(deezerInstance, dlObj, deemixSettings, listener);

  await deemixDownloader.start();

  ws.close();
});

app.ws('/api/track', async (ws, req) => {
  if (!req.query.id) return ws.close();

  const listener = {
    send(key, data) {
      if (data.downloaded) {
        ws.send(JSON.stringify({key: 'download', data: data.downloadPath.replace(process.cwd(), '')}));
        setTimeout(() => {
          fs.unlinkSync(data.downloadPath);
        }, 1000 * 60 * 60 /* 1 hour */);
      }

      ws.send(JSON.stringify({key, data}));
      console.log(`[${key}] ${inspect(data)}`);
    }
  };

  let track;
  try {
    track = await deezerInstance.api.get_track(req.query.id);
  } catch(err) {
    return ws.close();
  }

  listener.send('coverArt', track.album.cover_medium);

  let dlObj = await deemix.generateDownloadObject(deezerInstance, 'https://www.deezer.com/track/' + req.query.id, deezer.TrackFormats.FLAC);
  deemixDownloader = new deemix.downloader.Downloader(deezerInstance, dlObj, deemixSettings, listener);

  await deemixDownloader.start();

  ws.close();
});

deezerInstance.login_via_arl(process.env.DEEZER_ARL).then(() => {
  console.log('logged into deezer');
  app.listen(port, () => {
    console.log('hosting on ' + port);
  });
});
