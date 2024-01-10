export interface SpotifyToken {
  access_token: string,
  expires_in: number, //seconds
  refresh_token: string,
  scope: string,
  token_type: string
}