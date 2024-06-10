import clsx from 'clsx'
import Image from 'next/image'
import Skeleton from 'react-loading-skeleton'

import styles from '@/styles/album.module.css'

// import DownloadIcon from '@/img/DownloadIcon'

import TrackList, { Track } from './track'

import type { SearchAlbumResponse } from 'deezer-api-ts/dist/responses/search-album.response'
import { Suspense } from 'react'

const blankTrackList = (count: number) => Array(count).fill(<Track loading />)

export default async function Album(props: {
  loading?: boolean
  album?: SearchAlbumResponse
}) {
  const { album, loading } = props

  return (
    <div className={styles.albumContainer}>
      <div className={styles.album} id={`album-${album?.id ?? 'top'} `}>
        <div className={styles['album-inner-top']}>
          <div className={styles['album-metadata']}>
            <span className={styles.metadata}>
              <div className='font-bold'>
                {album ? album.title : null}
                {loading ? <Skeleton className='w-64' /> : null}
                {/* {#if subtitle}
            <span className="small">{subtitle}</span>
          {/if} */}
              </div>
              <div className='text-[medium] text-[--secondary-color]'>
                {album ? album.artist.name : null}
                {loading ? <Skeleton className='w-12' /> : null}
              </div>
            </span>
            {album ? (
              <div className={styles['album-inner-inner-bottom']}>
                <div className={styles['album-download']} title='Download'>
                  {/* <DownloadIcon /> */}
                </div>
              </div>
            ) : null}
          </div>
          <div className={styles['album-image-wrapper']}>
            {album ? (
              <Image
                className={clsx(styles['album-image'], {
                  explicit: album.explicit_lyrics
                })}
                width='250'
                height='250'
                src={album.cover_medium}
                alt={`Cover for '${album.title}'`}
              />
            ) : null}
            {loading ? (
              <div className={styles['album-image']}>
                <Skeleton className='block size-full' />
              </div>
            ) : null}
          </div>
        </div>
        <div className={styles['album-inner-bottom']}>
          {/* {#if log}
      <div className="progress-state">
        {#each $log as line, i}
          <span style="order: {-i}">{line}</span>
        {/each}
      </div>
    {/if} */}
        </div>
        <div
          className={styles['album-bottom']}
          id={`album-bottom-${`-${album?.id}` ?? ''}`}
        >
          {album ? (
            <Suspense fallback={blankTrackList(album.nb_tracks)}>
              <TrackList albumId={album.id} albumArtist={album.artist} />
            </Suspense>
          ) : null}
          {loading ? blankTrackList(3) : null}
        </div>
      </div>
    </div>
  )
}
