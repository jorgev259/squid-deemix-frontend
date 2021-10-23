import express from 'express';
import * as deemix from 'deemix';
import { deezerInstance, format } from '../deemix';
import { logger } from '../logger';
import { albumcache } from '..';

import { deemixDownloadWrapper } from '../download';

const router = express.Router();

router.ws('/api/album', async (ws, req: any) => {
  if (!req.query.id) return ws.close(1008, 'Supply a track ID in the query!');


  let dlObj: deemix.types.downloadObjects.IDownloadObject;
  try {
    dlObj = await deemix.generateDownloadObject(deezerInstance, 'https://www.deezer.com/album/' + req.query.id, format);
  } catch(err) {
    logger.error((err as Error).toString());
    return ws.close(1012, 'Album not found');
  }

  let isDone = false;

  ws.on('close', (code) => {
    if (isDone) return;
    dlObj.isCanceled = true;
    logger.debug(`client left unexpectedly with code ${code}; cancelling download`);
  });

  let album;
  try {
    album = albumcache[req.query.id] || (await deezerInstance.api.get_album(req.query.id));
    if (!albumcache[req.query.id]) albumcache[req.query.id] = album;
  } catch(err) {
    logger.error((err as Error).toString());
    return ws.close(1012, 'Album not found');
  }

  // @ts-expect-error
  await deemixDownloadWrapper(dlObj, ws, album.cover_medium, {id: album.id, title: album.title, artist: album.artist.name});
  isDone = true;
  logger.debug('download done');

  ws.close(1000);
});

export default router;