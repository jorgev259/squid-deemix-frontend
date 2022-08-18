import * as deemix from 'deemix';
import { queueDeletion, deleteQueuedFile } from './deletionQueue';
import { deemixSettings, deezerInstance } from './deemix';
import { logger } from './logger';
import { promisify } from 'util';
import { exec } from 'child_process';
import { config } from './config';

export interface Metadata {
  id: number,
  title: string,
  artist: string,
}

export async function deemixDownloadWrapper(dlObj: deemix.types.downloadObjects.IDownloadObject, ws: WebSocket, coverArt: string, metadata: Metadata) {
  let trackpaths: string[] = [];

  const listener = {
    send(key: any, data: any) {
      if (data.downloaded) {
        trackpaths.push(data.downloadPath);
        queueDeletion(data.downloadPath);
      }

      if (data.state !== 'tagging' && data.state !== 'getAlbumArt' && data.state !== 'getTags' && !dlObj.isCanceled) ws.send(JSON.stringify({key, data}));
    }
  };

  listener.send('coverArt', coverArt);
  listener.send('metadata', metadata);

  let deemixDownloader = new deemix.downloader.Downloader(deezerInstance, dlObj, deemixSettings, listener);
  try {
    await deemixDownloader.start();
  } catch(err) {
    logger.warn((err as Error).toString());
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
    logger.debug(`zipping ${folderName}`);
    try {
      await promisify(exec)(`cd "data/" && "${config.server.zipBinaryLocation}" ${config.server.zipArguments} "${folderName}.zip" "${folderName}"`);
    } catch(err) {
      logger.error((err as Error).toString());
      return ws.close(1011, 'Zipping album failed');
    }

    await ws.send(JSON.stringify({key: 'download', data: `data/${folderName}.zip`}));

    queueDeletion('./data/' + folderName + '.zip');
  } else if (trackpaths.length === 1) {
    await ws.send(JSON.stringify({key: 'download', data: trackpaths[0].replace(process.cwd(), '')}));
  }
}