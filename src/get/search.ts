import express from 'express';

import { searchcache } from '..';
import { config } from '../config';
import { logger } from '../logger';
import { deezerInstance } from '../deemix';

const router = express.Router();

router.get('/api/search', async (req, res) => {
  if (!req.query.search) return res.sendStatus(400);
  if (Array.isArray(req.query.search)) req.query.search = req.query.search.join('');
  req.query.search = req.query.search as string;

  let s: [Album];
  try {
    s = searchcache[req.query.search] || (await deezerInstance.api.search_album(req.query.search, {
      limit: config.limits.searchLimit || 15,
    })).data;
  } catch(err) {
    logger.error((err as Error).toString());
    return res.sendStatus(500);
  }
  if (!searchcache[req.query.search]) searchcache[req.query.search] = s;

  let format = s.map(s => {
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

export default router;