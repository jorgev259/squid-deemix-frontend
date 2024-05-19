import { NextRequest } from 'next/server'

import { deezerInstance } from '@/lib/deemix'
import { config } from '@/lib/config'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  const index = searchParams.get('index') || 0

  if (!query) return new Response('', { status: 400 })

  let s: DeezerResponse<[Album]>
  try {
    s = await deezerInstance.api.search_album(query, {
      limit: config.limits.searchLimit || 15,
      index: parseInt(index as string) || undefined
    })
  } catch (err) {
    throw err
  }

  let payload = {
    next: s.next && s.next.split('=').pop(), // dumb workaround of having to use regexes because i hate regexes
    total: s.total,
    data: s.data.map((s) => ({
      id: s.id,
      title: s.title,
      cover: s.md5_image,
      artist: {
        id: s.artist.id,
        name: s.artist.name
      }
    }))
  }

  return Response.json(payload)
}

export const revalidate = 600 // 600 seconds (10 minutes)
