import express from 'express';

import { albumcache } from '..';
import { logger } from '../logger';
import { deezerInstance } from '../deemix';

const router = express.Router();

router.get('/api/album', async (req, res) => {
  if (!req.query.id) return res.sendStatus(400);
  if (Array.isArray(req.query.id)) req.query.id = req.query.id.join('');
  req.query.id = req.query.id as string;

  let album: Album;
  try {
    album = albumcache[req.query.id] || (await deezerInstance.api.get_album(req.query.id));
    if (!albumcache[req.query.id]) albumcache[req.query.id] = album;
  } catch (err) {
    logger.error((err as Error).toString());
    return res.status(404).send('Album not found!');
  }

  res.send({
    id: album.id,
    title: album.title,
    link: album.link,
    releaseDate: album.release_date,
    explicitCover: album.explicit_content_cover,
    tracks: album.tracks.data.map(t => {
      return {
        id: t.id,
        title: t.title,
        duration: t.duration,
        link: t.link,
        artist: t.artist.name
      };
    })
  });
});

export default router;