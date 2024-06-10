import { searchAlbums as searchAlbumsApi, getAlbumTracks as getAlbumTracksApi } from 'deezer-api-ts'
import { cache } from 'react'

import { gotOptions } from '../constants/gotOptions'
import rateLimiter from './rateLimiter'

export const searchAlbums = cache(async (query: string, index?: number) => {
  await rateLimiter.handle()

  const result = await searchAlbumsApi(query, {
    // limit: config.limits.searchLimit || 15,
    index
  }, gotOptions)

  const payload: typeof result = {
    ...result,
    next: result.next && result.next.split('=').pop() // dumb workaround of having to use regexes because i hate regexes
  }

  if (!payload.data) throw new Error('Error: album search null')

  return payload.data
})

export const getAlbumTracks = cache(async (albumId: number) => {
  await rateLimiter.handle()

  const trackList = await getAlbumTracksApi(albumId)
  if (!trackList.data) throw new Error('Error: tracklist fetch null')

  return trackList.data
})