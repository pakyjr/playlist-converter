export interface SpotifyToken {
  access_token: string,
  expires_in: number, //seconds
  refresh_token: string,
  scope: string,
  token_type: string
}

export interface SpotifyTrack {
  is_local: boolean,
  artists: SpotifyArtist[],
  available_markets: string[],
  track_id: string,
  name: string,
  duration_ms: number,
  album: SpotifyAlbum
}

export interface SpotifyAlbum {
  artists: SpotifyArtist[],
  uri: string
  id: string,
  release_date: string,
  total_tracks: number
}

export interface SpotifyArtist {
  name: string,
  artist_id: string,
  uri: string
}

export interface SpotifyPlaylist {
  name: string,
  description: string,
  playlist_id: string,
  public: boolean,
  tracks: SpotifyTrack[]
}