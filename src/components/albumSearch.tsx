import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import Album from './album'
import Repeat from './repeat'

import { searchAlbums } from '@/lib/deezer'

export default async function AlbumSearch(props: { search?: string }) {
  const { search } = props

  return search ? (
    <div className='w-full'>
      <ErrorBoundary
        fallback={<div className='mt-3 ms-2'>Something went wrong</div>}
      >
        <Suspense
          fallback={
            <Repeat count={5}>
              <Album loading />
            </Repeat>
          }
        >
          <Page search={search} />
        </Suspense>
      </ErrorBoundary>
    </div>
  ) : null
}

async function Page(props: { search: string }) {
  const { search } = props
  const albumList = await searchAlbums(search)

  return albumList.length > 0 ? (
    albumList.map((a) => <Album key={a.id} album={a} />)
  ) : (
    <div className='mt-4 ms-2'>
      No matching results for &quot;{search}&quot;
    </div>
  )
}
