import { searchAlbums as searchAlbumsApi } from 'deezer-api-ts'
import { cache } from 'react'

// import { gotOptions } from '../constants/gotOptions'
import rateLimiter from './rateLimiter'

export const searchAlbums = cache(async (query: string, index?: number) => {
  await rateLimiter.handle()

  const result = await searchAlbumsApi(query, { index }/* , gotOptions */)

  const payload: typeof result = {
    ...result,
    next: result.next && result.next.split('=').pop() // dumb workaround of having to use regexes because i hate regexes
  }

  if (!payload.data) throw new Error('Error: album search null')

  return payload.data
})
