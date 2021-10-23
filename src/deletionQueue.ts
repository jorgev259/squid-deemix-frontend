import fs from 'fs';
import * as timeago from 'timeago.js';

import { logger } from './logger';
import { config } from './config';

interface QueuedFile {
  file: string,
  date: number
}

export const deleteTimer = config.timer.deleteTimer || 1000 * 60 * 25;

const toDeleteLocation = './data/toDelete.json';

if (!fs.existsSync(toDeleteLocation)) fs.writeFileSync(toDeleteLocation, '[]', {encoding: 'utf8'});
let toDelete: QueuedFile[] = JSON.parse(fs.readFileSync(toDeleteLocation, {encoding: 'utf8'}));

export function updateQueueFile() {
  try {
    fs.writeFileSync(toDeleteLocation, JSON.stringify(toDelete), {encoding: 'utf8'});
  } catch(err) {
    logger.error('failed to write to deletion queue json file! wrong permissions or ran out of space?', err);
  }
}

export function deleteQueuedFile(file: string) {
  toDelete = toDelete.filter((c: QueuedFile) => c.file !== file);
  updateQueueFile();
  fs.unlink(file, (err) => {
    if (err) {
      logger.warn(`failed to delete ${file}!`);
      logger.warn(err.toString());
      logger.warn('if this file still exists, you will have to manually delete it');
    }
  });
}

export function queueDeletion(file: string) {
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