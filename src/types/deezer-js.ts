interface SearchOptions {
  index?: number;
  limit?: number;
}

enum SearchOrder {
  RANKING = "RANKING",
  TRACK_ASC = "TRACK_ASC",
  TRACK_DESC = "TRACK_DESC",
  ARTIST_ASC = "ARTIST_ASC",
  ARTIST_DESC = "ARTIST_DESC",
  ALBUM_ASC = "ALBUM_ASC",
  ALBUM_DESC = "ALBUM_DESC",
  RATING_ASC = "RATING_ASC",
  RATING_DESC = "RATING_DESC",
  DURATION_ASC = "DURATION_ASC",
  DURATION_DESC = "DURATION_DESC",
}

interface QueryOptions extends SearchOptions {
  strict?: boolean;
  order?: SearchOrder;
}

type DeezerResponse<Data> = {
  data: Data;
  total: number;
  next: string;
};

declare module "deezer-js" {
  import { AlbumResponse, AlbumTrack } from "deezer-api-ts/dist/responses/album.response";

  class Deezer {
    logged_in: boolean;

    login_via_arl(arl: string): Promise<boolean>;

    api: {
      search_album(
        query: string,
        options?: QueryOptions
      ): Promise<DeezerResponse<[AlbumResponse]>>;

      get_album_tracks(
        album_id: string | number,
        options?: SearchOptions
      ): Promise<DeezerResponse<[AlbumTrack]>>;
    }
  }
}
