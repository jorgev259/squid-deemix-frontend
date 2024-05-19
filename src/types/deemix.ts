enum TrackFormats {
  FLAC = 'FLAC',
  MP3_320 = 'MP3_320',
  MP3_128 = 'MP3_128',
  MP4_RA3 = 'MP4_RA3',
  MP4_RA2 = 'MP4_RA2',
  MP4_RA1 = 'MP4_RA1',
  DEFAULT = 'DEFAULT',
  LOCAL = 'LOCAL'
}

export interface DeemixSettings {
  timer: {
    deleteTimer: number
  }

  server: {
    port: number | string
    zipArguments: string
    zipBinaryLocation: string
  }

  limits: {
    searchLimit: 15
  }

  deemix: {
    albumNameTemplate: string
    albumTrackNameTemplate: string
    createM3U8File: boolean
    downloadLocation: string
    embeddedArtworkPNG: boolean
    embeddedArtworkSize: number
    jpegImageQuality: number
    localArtworkFormat: string
    localArtworkSize: number
    removeDuplicateArtists: boolean
    saveArtwork: boolean
    trackFormat: TrackFormats
    trackNameTemplate: string
  }
}
