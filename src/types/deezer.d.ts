type DeezerResponse<Data> = {
  data: Data,
  total: number,
  next: string,
}

enum ExplicitContent {
  NOT_EXPLICIT,
  EXPLICIT,
  UNKNOWN,
  EDITED,
  PARTIALLY_EXPLICIT,
  PARTIALLY_UNKNOWN,
  NO_ADVICE_AVAILABLE,
  PARTIALLY_NO_ADVICE_AVAILABLE,
}

enum SearchOrder {
  RANKING       = "RANKING",
  TRACK_ASC     = "TRACK_ASC",
  TRACK_DESC    = "TRACK_DESC",
  ARTIST_ASC    = "ARTIST_ASC",
  ARTIST_DESC   = "ARTIST_DESC",
  ALBUM_ASC     = "ALBUM_ASC",
  ALBUM_DESC    = "ALBUM_DESC",
  RATING_ASC    = "RATING_ASC",
  RATING_DESC   = "RATING_DESC",
  DURATION_ASC  = "DURATION_ASC",
  DURATION_DESC = "DURATION_DESC"
}

interface Track {
  id: number,
  readable: boolean,
  title: string,
  title_short: string,
  title_version: string,
  isrc: string,
  link: string,
  share: string,
  duration: number,
  track_position: number,
  disk_number: number,
  rank: number,
  release_date: string,
  explicit_lyrics: boolean,
  explicit_content_lyrics: ExplicitContent,
  explicit_content_cover: ExplicitContent,
  preview: string,
  bpm: number,
  gain: number,
  available_countries: string[],
  contributors: Contributor[],
  md5_image: string,
  artist: Pick<Artist, "id" | "name" | "link" | "share" | "picture" | "picture_small" | "picture_medium" | "picture_big" | "picture_xl" | "radio" | "tracklist">,
  album: Pick<Album, "id" | "title" | "link" | "cover" | "cover_small" | "cover_medium" | "cover_big" | "cover_xl" | "md5_image" | "release_date" | "tracklist">,
}

interface Artist {
  id: number,
  name: string,
  link: string,
  share: string,
  picture: string,
  picture_small: string,
  picture_medium: string,
  picture_big: string,
  picture_xl: string,
  nb_album: number,
  nb_fan: number,
  radio: boolean,
  tracklist: string,
}

interface Contributor {
  id: number,
  name: string,
  link: string,
  share: string,
  picture: string,
  picture_small: string,
  picture_medium: string,
  picture_big: string,
  picture_xl: string,
  radio: boolean,
  tracklist: string,
  role: string,
}

interface Album {
  id: number,
  title: string,
  upc: string,
  link: string,
  share: string,
  cover: string,
  cover_small: string,
  cover_medium: string,
  cover_big: string,
  cover_xl: string,
  md5_image: string,
  genre_id: number, // use an enum?
  genres: any,
  label: string,
  nb_tracks: number,
  duration: number,
  fans: number,
  release_date: string,
  record_type: string,
  available: boolean,
  tracklist: string,
  explicit_lyrics: boolean,
  explicit_content_lyrics: ExplicitContent,
  explicit_content_cover: ExplicitContent,
  contributors: Contributor[],
  artist: Pick<Artist, "id" | "name" | "picture" | "picture_small" | "picture_medium" | "picture_big" | "picture_xl", "tracklist">,
  tracks: Pick<DeezerResponse<Pick<Track, "id" | "readable" | "title" | "title_short" | "title_version" | "link" | "duration" | "rank" | "explicit_lyrics" | "explicit_content_lyrics" | "explicit_content_cover" | "preview" | "md5_image" | "artist">[]>, "data">,
}

interface SearchOptions {
  index?: number,
  limit?: number,
}

interface QueryOptions extends SearchOptions {
  strict?: boolean,
  order?: SearchOrder,
}

declare module 'deezer-js' {
  enum TrackFormats {
    FLAC    = 9,
    MP3_320 = 3,
    MP3_128 = 1,
    MP4_RA3 = 15,
    MP4_RA2 = 14,
    MP4_RA1 = 13,
    DEFAULT = 8,
    LOCAL   = 0,
  }

  class API {
    http_headers: any;
    cookie_jar: CookieJar;
    access_token: string | null;

    constructor(cookie_jar: CookieJar, headers: any): void;

    api_call(method: string, args?: any): Promise<any>;

    get_album(album_id: string | number): Promise<Album>;
    get_album_by_UPC(upc: string): Promise<Album>;
    get_album_comments(album_id: string | number, options?: SearchOptions): Promise<any>;
    get_album_fans(album_id: string | number, options?: SearchOptions): Promise<any>;
    get_album_tracks(album_id: string | number, options?: SearchOptions): Promise<DeezerResponse<[Track]>>;

    get_artist(artist_id: string | number): Promise<Artist>;
    get_artist_top(artist_id: string | number, options?: SearchOptions): Promise<any>;
    get_artist_albums(artist_id: string | number, options?: SearchOptions): Promise<DeezerResponse<[Album]>>;
    get_artist_comments(artist_id: string | number, options?: SearchOptions): Promise<any>;
    get_artist_fans(artist_id: string | number, options?: SearchOptions): Promise<any>;
    get_artist_related(artist_id: string | number, options?: SearchOptions): Promise<any>;
    get_artist_radio(artist_id: string | number, options?: SearchOptions): Promise<any>;
    get_artist_playlists(artist_id: string | number, options?: SearchOptions): Promise<any>;

    get_chart(genre_id?: string | number, options?: SearchOptions): Promise<any>;
    get_chart_tracks(genre_id?: string | number, options?: SearchOptions): Promise<any>;
    get_chart_albums(genre_id?: string | number, options?: SearchOptions): Promise<any>;
    get_chart_artists(genre_id?: string | number, options?: SearchOptions): Promise<any>;
    get_chart_playlists(genre_id?: string | number, options?: SearchOptions): Promise<any>;
    get_chart_podcasts(genre_id?: string | number, options?: SearchOptions): Promise<any>;

    get_comment(comment_id: string | number): Promise<Comment>;

    get_editorials(options?: SearchOptions): Promise<any>;
    get_editorial(genre_id?: number): Promise<any>;

    // for now who cares

    search(query: string, options?: QueryOptions): Promise<DeezerResponse<[Track | Album | Artist | Playlist | Radio | User]>>;
    search_album(query: string, options?: QueryOptions): Promise<DeezerResponse<[Album]>>;
    search_artist(query: string, options?: QueryOptions): Promise<DeezerResponse<[Artist]>>;
    search_playlist(query: string, options?: QueryOptions): Promise<DeezerResponse<[Playlist]>>;
    search_radio(query: string, options?: QueryOptions): Promise<DeezerResponse<[Radio]>>;
    search_track(query: string, options?: QueryOptions): Promise<DeezerResponse<[Track]>>;

    get_track(song_id: string | number): Promise<Track>;
    get_track_by_ISRC(isrc: string): Promise<Track>;

    get_user(user_id: string | number): Promise<User>;
  }

  class GW {

  }

  class Deezer {
    http_headers: any;
    cookie_jar: CookieJar;
    logged_in: boolean;
    current_user: any;
    childs: any[];
    selected_account: number;

    api: API;
    gw: GW;

    constructor(): void;

    login(email: string, password: string, re_captcha_token: string, child: number): Promise<boolean>;
    login_via_arl(arl: string): Promise<boolean>;
    _post_login(user_data: any): void;
    change_account(child_n: number): any[2];
    get_track_url(track_token: string, format: TrackFormats): Promise<Track>;
    get_tracks_url(track_tokens: string[] | string, format: TrackFormats): Promise<Track[]>;
  }
}