const express = require('express');
const deezer = require('deezer-js');
const deemix = require('deemix');
const path = require('path');
const { promisify } = require('util');
const fs = require('fs');
const { exec } = require('child_process');
const timeago = require('timeago.js');
const toml = require('toml');
const winston = require('winston');

const logFormatter = winston.format.printf(({ level, message, timestamp }) => {
  return `${new Date(timestamp).toLocaleDateString('en-GB', {timeZone: 'UTC'})} ${new Date(timestamp).toLocaleTimeString('en-GB', {timeZone: 'UTC'})} ${level.replace('info', 'I').replace('warn', '!').replace('error', '!!')}: ${message}`;
});

winston.addColors({
  error: 'red',
  debug: 'blue',
  warn: 'yellow',
  http: 'gray',
  info: 'blue',
  verbose: 'cyan',
  silly: 'magenta'
});

const logger = winston.createLogger({
	level: 'debug',
	format: winston.format.combine(
		winston.format.simple()
	),
	transports: [
		new winston.transports.File({filename: 'deemix-web-fe-error.log', level: 'warn'}),
		new winston.transports.File({filename: 'deemix-web-fe.log'}),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        logFormatter
      )
    })
	]
});

if (!fs.existsSync('./config.toml')) {
  if (!fs.existsSync('./config.example.toml')) {
    logger.error('no config.toml OR config.example.toml found!!! what the hell are you up to!!!');
    process.exit(1);
  }
  logger.warn('copying config.example.toml to config.toml as it was not found. the default config may not be preferable!');
  fs.copyFileSync('./config.example.toml', './config.toml');
}
const config = toml.parse(fs.readFileSync('./config.toml'));
logger.info('loaded config');

let searchcache = {};
let albumcache = {};
let trackcache = {};

const port = config.server.port || 4500;
const deleteTimer = config.timer.deleteTimer || 1000 * 60 * 25;

require('dotenv').config();

const app = new express();
const expressWs = require('express-ws')(app);
const deezerInstance = new deezer.Deezer();
let deemixDownloader;

let deemixSettings = deemix.settings.DEFAULTS
deemixSettings.downloadLocation = path.join(process.cwd(), 'data/');
deemixSettings.overwriteFile = deemix.settings.OverwriteOption.ONLY_TAGS;

const format = deezer.TrackFormats[config.deemix.trackFormat || 'FLAC'];
deemixSettings.maxBitrate = String(format);
deemixSettings.tracknameTemplate = config.deemix.trackNameTemplate || deemixSettings.tracknameTemplate;
deemixSettings.albumTracknameTemplate = config.deemix.albumTrackNameTemplate || deemixSettings.albumTracknameTemplate;
deemixSettings.albumNameTemplate = config.deemix.albumNameTemplate || deemixSettings.createM3U8File;
deemixSettings.createM3U8File = config.deemix.createM3U8File !== undefined ? config.deemix.createM3U8File : deemixSettings.createM3U8File;
deemixSettings.embeddedArtworkPNG = config.deemix.embeddedArtworkPNG !== undefined ? config.deemix.embeddedArtworkPNG : deemixSettings.embeddedArtworkPNG;
deemixSettings.embeddedArtworkSize = config.deemix.embeddedArtworkSize || deemixSettings.embeddedArtworkSize;
deemixSettings.saveArtwork = config.deemix.saveArtwork !== undefined ? config.deemix.saveArtwork : deemixSettings.saveArtwork;
deemixSettings.localArtworkSize = deemixSettings.localArtworkSize || deemixSettings.localArtworkSize;
deemixSettings.localArtworkFormat = deemixSettings.localArtworkFormat || deemixSettings.localArtworkFormat;
deemixSettings.jpegImageQuality = deemixSettings.jpegImageQuality || deemixSettings.jpegImageQuality;
deemixSettings.removeDuplicateArtists = config.deemix.removeDuplicateArtists !== undefined ? config.deemix.removeDuplicateArtists : deemixSettings.removeDuplicateArtists;

const toDeleteLocation = './data/toDelete.json';

if (!fs.existsSync(toDeleteLocation)) fs.writeFileSync(toDeleteLocation, '[]', {encoding: 'utf8'});
let toDelete = JSON.parse(fs.readFileSync(toDeleteLocation, {encoding: 'utf8'}));

function updateQueueFile() {
  try {
    fs.writeFileSync(toDeleteLocation, JSON.stringify(toDelete), {encoding: 'utf8'});
  } catch(err) {
    logger.error('failed to write to deletion queue json file! wrong permissions or ran out of space?', err);
  }
}

function deleteQueuedFile(file) {
  toDelete = toDelete.filter(c => c.file !== file);
  updateQueueFile();
  fs.unlink(file, (err) => {
    if (err) {
      logger.warn(`failed to delete ${file}!`);
      logger.warn(err.toString());
      logger.warn('if this file still exists, you will have to manually delete it');
    }
  });
}

function queueDeletion(file) {
  logger.info(`queued deletion of ${file} ${timeago.format(Date.now() + deleteTimer)}`);

  toDelete.push({
    date: Date.now() + deleteTimer,
    file
  });
  setTimeout(() => {
    logger.info(`deleting queued file ${file}`);
    deleteQueuedFile(file);
  }, deleteTimer);
  updateQueueFile();
}

logger.info(`loaded ${toDelete.length} items in deletion queue`);
let updateQueue = false;
for (let del of toDelete) {
  if (Date.now() - del.date >= 0) {
    logger.warn(`deleting ${del.file} - was meant to be deleted ${timeago.format(del.date)}`);
    deleteQueuedFile(del.file);
  } else {
    logger.info(`queueing deletion of ${del.file} ${timeago.format(del.date)}`);
    setTimeout(() => {
      logger.info(`deleting queued file ${del.file}`);
      deleteQueuedFile(del.file);
    }, del.date - Date.now());
  }
};

if (updateQueue) {
  updateQueueFile();
  logger.info('updated deletion queue json');
}

if (config.server.proxy) {
  app.enable('trust proxy');
  logger.info('enabled express.js reverse proxy settings');
}

app.use((req, res, next) => {
  logger.http(`${(config.server.proxy && req.headers['x-forwarded-for']) || req.connection.remoteAddress} ${req.method} ${req.originalUrl} `);
  next();
});

app.use(express.static('public'));
app.use('/data', express.static('data', {extensions:  ['flac', 'mp3']}));

app.get('/api/search', async (req, res) => {
  if (!req.query.search) return res.sendStatus(400);
  let s;
  try {
    s = searchcache[req.query.search] || (await deezerInstance.api.search_album(req.query.search, {
      limit: config.limits.searchLimit || 15,
    }));
  } catch(err) {
    logger.error(err.toString());
    res.sendStatus(500);
  }
  if (!searchcache[req.query.search]) searchcache[req.query.search] = s;

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
    album = albumcache[req.query.id] || (await deezerInstance.api.get_album(req.query.id));
    if (!albumcache[req.query.id]) albumcache[req.query.id] = album;
  } catch (err) {
    logger.error(err.toString());
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

async function deemixDownloadWrapper(dlObj, ws, coverArt, metadata) {
  let trackpaths = [];

  const listener = {
    send(key, data) {
      if (data.downloaded) {
        trackpaths.push(data.downloadPath);
        queueDeletion(data.downloadPath);
      }

      if (data.state !== 'tagging' && data.state !== 'getAlbumArt' && data.state !== 'getTags' && !dlObj.isCanceled) ws.send(JSON.stringify({key, data}));
    }
  };

  listener.send('coverArt', coverArt);
  listener.send('metadata', metadata);

  deemixDownloader = new deemix.downloader.Downloader(deezerInstance, dlObj, deemixSettings, listener);
  try {
    await deemixDownloader.start();
  } catch(err) {
    logger.warn(err.toString());
    logger.warn('(this may be deemix just being whiny)');
  }

  if (dlObj.isCanceled) {
    logger.debug('download gracefully cancelled, cleaning up');
    trackpaths.forEach((q) => {
      logger.info(`removing ${q}`);
      deleteQueuedFile(q);
    });
  } else if (trackpaths.length > 1) {
    await ws.send(JSON.stringify({key: 'zipping'}));

    const folderName = trackpaths[0].split('/').slice(-2)[0];
    try {
      await promisify(exec)(`${config.server.zipBinaryLocation} ${config.server.zipArguments} "data/${folderName}.zip" "data/${folderName}"`);
    } catch(err) {
      logger.error(err.toString());
      return ws.close(1011, 'Zipping album failed');
    }

    await ws.send(JSON.stringify({key: 'download', data: `data/${folderName}.zip`}));

    queueDeletion('./data/' + folderName + '.zip');
  } else if (trackpaths.length === 1) {
    await ws.send(JSON.stringify({key: 'download', data: trackpaths[0].replace(process.cwd(), '')}));
  }
}

app.ws('/api/album', async (ws, req) => {
  if (!req.query.id) return ws.close(1008, 'Supply a track ID in the query!');

  const dlObj = await deemix.generateDownloadObject(deezerInstance, 'https://www.deezer.com/album/' + req.query.id, format);

  ws.on('close', (code) => {
    dlObj.isCanceled = true;
    logger.debug(`client left unexpectedly with code ${code}; cancelling download`);
  });

  let album;
  try {
    album = albumcache[req.query.id] || (await deezerInstance.api.get_album(req.query.id));
    if (!albumcache[req.query.id]) albumcache[req.query.id] = album;
  } catch(err) {
    logger.error(err.toString());
    return ws.close(1012, 'Album not found');
  }

  await deemixDownloadWrapper(dlObj, ws, album.cover_medium, {id: album.id, title: album.title, artist: album.artist.name});

  ws.close(1000);
});

app.ws('/api/track', async (ws, req) => {
  if (!req.query.id) return ws.close(1008, 'Supply a track ID in the query!');

  const dlObj = await deemix.generateDownloadObject(deezerInstance, 'https://www.deezer.com/track/' + req.query.id, format);

  let track;
  try {
    track = trackcache[req.query.id] || (await deezerInstance.api.get_track(req.query.id));
    if (!trackcache[req.query.id]) trackcache[req.query.id] = track;
  } catch(err) {
    logger.error(err.toString());
    return ws.close(1012, 'Track not found');
  }

  await deemixDownloadWrapper(dlObj, ws, track.album.cover_medium, {id: track.id, title: track.title, artist: track.artist.name});

  ws.close(1000);
});

deezerInstance.login_via_arl(process.env.DEEZER_ARL).then(() => {
  logger.info('logged into deezer');
  app.listen(port, () => {
    logger.info(`hosting on http://localhost:${port} and wss://localhost:${port}`);
  });
});
