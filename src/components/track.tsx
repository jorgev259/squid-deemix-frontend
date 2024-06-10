import Skeleton from 'react-loading-skeleton'
import { Suspense } from 'react'

import styles from '@/styles/track.module.css'

import { formatTime } from '@/lib/time'

// import DownloadIcon from '@/img/DownloadIcon'

import type {
  AlbumArtist,
  AlbumTrack
} from 'deezer-api-ts/dist/responses/album.response'
import { AlbumTracksResponse } from 'deezer-api-ts/dist/responses/album-tracks.response'
import { Response } from 'deezer-api-ts/dist/responses/base.response'
import Repeat from './repeat'

export default async function TrackList(props: {
  url?: string
  albumArtist: AlbumArtist
  total: number
}) {
  const { url: urlString, albumArtist, total } = props
  if (!urlString) return null

  const url = new URL(urlString)
  const index = parseInt(url.searchParams.get('index') ?? '0')
  const remaining = Math.max(total - index, 0)

  const { data, next }: Response<AlbumTracksResponse> = await (
    await fetch(url)
  ).json()

  return (
    <>
      {data.map((t) => (
        <Track key={t.id} track={t} albumArtist={albumArtist} />
      ))}
      <Suspense
        fallback={
          <Repeat count={remaining}>
            <Track loading />
          </Repeat>
        }
      >
        <TrackList url={next} albumArtist={albumArtist} total={total} />
      </Suspense>
    </>
  )
}

export function Track(props: {
  loading?: boolean
  track?: AlbumTrack
  albumArtist?: AlbumArtist
}) {
  const { track, albumArtist, loading } = props

  return (
    <div className={styles.track} id={`track-${track?.id}`}>
      <span className={styles['track-left']}>
        {loading ? <Skeleton /> : null}
        {track && albumArtist && track.artist.name !== albumArtist.name
          ? `${track.artist.name} - ${track.title}`
          : track?.title}
      </span>
      {track ? (
        <span className={styles['track-right']}>
          {track.explicit_lyrics ? (
            <div className={styles.tag}>EXPLICIT</div>
          ) : null}
          <span className='text-[medium] text-[--secondary-color]'>
            {formatTime(parseInt(track.duration))}
          </span>
          <span className={styles['track-download']} title='Download'>
            {/* <DownloadIcon /> */}
          </span>
        </span>
      ) : null}
    </div>
  )
}
