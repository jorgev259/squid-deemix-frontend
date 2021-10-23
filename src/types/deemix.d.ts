interface Listener {
  send(key: any, data: any): void
}

interface TagOptions {
  title: boolean,
  artist: boolean,
  album: boolean,
  cover: boolean,
  trackNumber: boolean,
  trackTotal: boolean,
  discNumber: boolean,
  discTotal: boolean,
  albumArtist: boolean,
  genre: boolean,
  year: boolean,
  date: boolean,
  explicit: boolean,
  isrc: boolean,
  length: boolean,
  barcode: boolean,
  bpm: boolean,
  replayGain: boolean,
  label: boolean,
  lyrics: boolean,
  syncedLyrics: boolean,
  copyright: boolean,
  composer: boolean,
  involvedPeople: boolean,
  source: boolean,
  rating: boolean,
  savePlaylistAsCompilation: boolean,
  useNullSeparator: boolean,
  saveID3v1: boolean,
  multiArtistSeparator: string,
  singleAlbumArtist: boolean,
  coverDescriptionUTF8: boolean
}

interface DeemixSettings {
  downloadLocation: string,
  tracknameTemplate: string,
  albumTracknameTemplate: string,
  playlistTracknameTemplate: string,
  createPlaylistFolder: boolean,
  playlistNameTemplate: string,
  createArtistFolder: boolean,
  artistNameTemplate: string,
  createAlbumFolder: boolean,
  albumNameTemplate: string,
  createCDFolder: boolean,
  createStructurePlaylist: boolean,
  createSingleFolder: boolean,
  padTracks: boolean,
  paddingSize: string,
  illegalCharacterReplacer: string,
  queueConcurrency: number,
  maxBitrate: keyof TrackFormats,
  fallbackBitrate: boolean,
  fallbackSearch: boolean,
  logErrors: boolean,
  logSearched: boolean,
  overwriteFile: OverwriteOption,
  createM3U8File: boolean,
  playlistFilenameTemplate: string,
  syncedLyrics: boolean,
  embeddedArtworkSize: number,
  embeddedArtworkPNG: boolean,
  localArtworkSize: number,
  localArtworkFormat: string,
  saveArtwork: boolean,
  coverImageTemplate: string,
  saveArtworkArtist: boolean,
  artistImageTemplate: string,
  jpegImageQuality: number,
  dateFormat: string,
  albumVariousArtists: boolean,
  removeAlbumVersion: boolean,
  removeDuplicateArtists: boolean,
  featuredToTitle: FeaturesOption,
  titleCasing: string,
  artistCasing: string,
  executeCommand: string,
  tags: TagOptions
}

declare module 'deemix' {
  function generateDownloadObject(dz: Deezer, link: string, bitrate: TrackFormats, plugins?: any, listener?: Listener): Promise<IDownloadObject>

  module downloader {
    class Downloader {
      dz: Deezer;

      constructor(dz: Deezer, downloadObject: IDownloadObject, settings: DeemixSettings, listener: Listener): void

      start(): Promise<void>
    }
  }

  module types {
    module downloadObjects {
      class IDownloadObject {
        isCanceled: boolean;

        constructor(obj: any): void;
      }
    }
  }

  module settings {
    enum OverwriteOption {
      OVERWRITE = 'y', // Yes, overwrite the file
      DONT_OVERWRITE = 'n', // No, don't overwrite the file
      DONT_CHECK_EXT = 'e', // No, and don't check for extensions
      KEEP_BOTH = 'b', // No, and keep both files
      ONLY_TAGS = 't', // Overwrite only the tags
    }

    // What should I do with featured artists?
    enum FeaturesOption {
      NO_CHANGE = "0", // Do nothing
      REMOVE_TITLE = "1", // Remove from track title
      REMOVE_TITLE_ALBUM = "3", // Remove from track title and album title
      MOVE_TITLE = "2" // Move to track title
    }

    const DEFAULTS: DeemixSettings
  }
}