import { SpotifyToken } from '@iuly/iuly-models'

export interface SpotifyDALInterface {
  addSessionToken(token: SpotifyToken, sessionId: string): Promise<any>,
  // getToken(sessionId: string): Promise<string | null>
}