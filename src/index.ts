import express from 'express';
import * as dotenv from 'dotenv';
import expressws from 'express-ws';

dotenv.config();

import { logger } from './logger';
import { config } from './config';
import { deezerInstance } from './deemix';

export const port = config.server.port || 4500;

export let searchcache: Record<string, [Album]> = {};
export let albumcache: Record<string, Album> = {};
export let trackcache: Record<string, Track> = {};

export const app = express();
expressws(app);

if (config.server.proxy) {
  app.enable('trust proxy');
  logger.info('enabled express.js reverse proxy settings');
}

app.use(express.static('app/dist'));

app.use((req, res, next) => {
  logger.http(`${(config.server.proxy && req.headers['x-forwarded-for']) || req.connection.remoteAddress} ${req.method} ${req.originalUrl} `);
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use('/data', express.static('data', {extensions:  ['flac', 'mp3']}));

import get from './get';
get.forEach((q) => {app.use(q)});

import ws from './ws';
ws.forEach((q) => {app.use(q)});

deezerInstance.login_via_arl(process.env.DEEZER_ARL || '').then(() => {
  logger.info('logged into deezer');
  app.listen(port, () => {
    logger.info(`hosting on http://localhost:${port} and wss://localhost:${port}`);
  });
});
