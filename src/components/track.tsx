import Skeleton from 'react-loading-skeleton'
import { Suspense } from 'react'

import styles from '@/styles/track.module.css'

import { formatTime } from '@/lib/time'
import { getDeezerClient } from '@/lib/deezer'

// import DownloadIcon from '@/img/DownloadIcon'

import type {
  AlbumArtist,
  AlbumTrack
} from 'deezer-api-ts/dist/responses/album.response'

import Repeat from './repeat'

export default async function TrackList(props: {
  albumId: number
  albumArtist: AlbumArtist
  index: number
  albumTotal: number
  next?: string
}) {
  const { albumArtist, albumId, index, next: currentNext, albumTotal } = props
  if (!currentNext && index > 0) return null

  const deezerClient = await getDeezerClient()
  const remaining = Math.max(albumTotal - index, 0)

  const {
    data,
    next: newNext,
    total
  } = await deezerClient.api.get_album_tracks(albumId, {
    index
  })

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
        <TrackList
          albumId={albumId}
          albumArtist={albumArtist}
          index={index + total}
          albumTotal={albumTotal}
          next={newNext}
        />
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
