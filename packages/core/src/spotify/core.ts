import { SpotifyDAL } from '@iuly/iuly-dal'
import { SpotifyDALInterface } from '@iuly/iuly-interfaces'
import { SpotifyToken } from '@iuly/iuly-models'

export class SpotifyCore {

  constructor(private spotifyDal: SpotifyDALInterface) { }

  async addSessionToken(token: SpotifyToken, sessionId: string) {
    this.spotifyDal.addSessionToken(token, sessionId);
  }

  async getSessionToken(sessionId: string): Promise<string | null> {
    let token = await this.spotifyDal.getToken(sessionId);
    if (token) return token
    return null
  }
}