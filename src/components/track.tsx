import type {
  AlbumArtist,
  AlbumTrack
} from 'deezer-api-ts/dist/responses/album.response'

import styles from '@/styles/track.module.css'

import { formatTime } from '@/lib/time'
import { getAlbumTracks } from '@/lib/deezer'

// import DownloadIcon from '@/img/DownloadIcon'
import Skeleton from 'react-loading-skeleton'

export default async function TrackList(props: {
  albumId: number
  albumArtist: AlbumArtist
}) {
  const { albumId, albumArtist } = props

  const trackList = await getAlbumTracks(albumId)

  return trackList.map((t) => (
    <Track key={t.id} track={t} albumArtist={albumArtist} />
  ))
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
