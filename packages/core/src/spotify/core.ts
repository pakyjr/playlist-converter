import { SpotifyDAL } from '@iuly/iuly-dal'
import { SpotifyDALInterface } from '@iuly/iuly-interfaces'

export class SpotifyCore {

  constructor(private spotifyDal: SpotifyDALInterface) { }

  async addSessionToken(token: string, sessionId: string) {
    this.spotifyDal.addSessionToken(token, sessionId);
  }
}