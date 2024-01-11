export interface SpotifyDALInterface {
  addSessionToken(token: string, sessionId: string): Promise<any>
}