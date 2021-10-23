import express from 'express';
import * as deemix from 'deemix';
import { deezerInstance, format } from '../deemix';
import { logger } from '../logger';
import { trackcache } from '..';

import { deemixDownloadWrapper } from '../download';

const router = express.Router();

router.ws('/api/track', async (ws, req: any) => {
  if (!req.query.id) return ws.close(1008, 'Supply a track ID in the query!');

  let dlObj: deemix.types.downloadObjects.IDownloadObject;
  try {
    dlObj = await deemix.generateDownloadObject(deezerInstance, 'https://www.deezer.com/track/' + req.query.id, format);
  } catch(err) {
    logger.error((err as Error).toString());
    return ws.close(1012, 'Track not found');
  }
  let isDone = false;

  ws.on('close', (code: number) => {
    if (isDone) return;
    dlObj.isCanceled = true;
    logger.debug(`client left unexpectedly with code ${code}; cancelling download`);
  });

  let track;
  try {
    track = trackcache[req.query.id] || (await deezerInstance.api.get_track(req.query.id));
    if (!trackcache[req.query.id]) trackcache[req.query.id] = track;
  } catch(err) {
    logger.error((err as Error).toString());
    return ws.close(1012, 'Track not found');
  }

  // @ts-expect-error
  await deemixDownloadWrapper(dlObj, ws, track.album.cover_medium, {id: track.id, title: track.title, artist: track.artist.name});
  isDone = true;
  logger.debug('download done');

  ws.close(1000);
});

export default router;