import { NextRequest } from 'next/server'

import { searchAlbums } from 'deezer-api-ts'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  const index = searchParams.get('index') || 0

  if (!query) return new Response('', { status: 400 })

  const result = await searchAlbums(query, {
    // limit: config.limits.searchLimit || 15,
    index: parseInt(index as string) || undefined
  })

  const payload = {
    next: result.next && result.next.split('=').pop(), // dumb workaround of having to use regexes because i hate regexes
    total: result.total,
    data: result.data.map((album) => ({
      id: album.id,
      title: album.title,
      cover: album.md5_image,
      artist: {
        id: album.artist.id,
        name: album.artist.name
      }
    }))
  }

  return Response.json(payload)
}

export const revalidate = 600 // 600 seconds (10 minutes)
