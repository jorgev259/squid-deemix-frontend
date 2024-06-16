import clsx from 'clsx'
import Image from 'next/image'
import Skeleton from 'react-loading-skeleton'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import styles from '@/styles/album.module.css'

// import DownloadIcon from '@/img/DownloadIcon'

import TrackList, { Track } from './track'
import Repeat from './repeat'

import type { AlbumResponse } from 'deezer-api-ts/dist/responses/album.response'

export default async function Album(props: {
  loading?: boolean
  album?: AlbumResponse
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
            <Suspense
              fallback={
                <Repeat count={Math.min(album.nb_tracks, 25)}>
                  <Track loading />
                </Repeat>
              }
            >
              <ErrorBoundary
                fallback={
                  <div className='text-sm p-5 bg-[var(--dark-bg)]'>
                    Failed to fetch tracklist. Try again later or bother
                    @ChitoWarlock about it
                  </div>
                }
              >
                <TrackList
                  albumId={album.id}
                  albumArtist={album.artist}
                  index={0}
                  albumTotal={album.nb_tracks}
                />
              </ErrorBoundary>
            </Suspense>
          ) : null}
          {loading ? (
            <Repeat count={2}>
              <Track loading />
            </Repeat>
          ) : null}
        </div>
      </div>
    </div>
  )
}
