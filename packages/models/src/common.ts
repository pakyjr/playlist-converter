export interface ValidPlaylistUrl {
  valid: boolean;
  provider?: string;
  url?: string;
}

export enum MusicProvider {
  AppleMusic = 'Apple Music',
  Spotify = 'Spotify'
}