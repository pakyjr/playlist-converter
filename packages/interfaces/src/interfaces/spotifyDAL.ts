import { SpotifyToken } from '@iuly/iuly-models'

export interface SpotifyDALInterface {
  addSessionToken(token: SpotifyToken, sessionId: string): Promise<void>,
  getToken(sessionId: string): Promise<string | null>
  getPlaylist(token: string, playlistID: string): Promise<any | null>
}