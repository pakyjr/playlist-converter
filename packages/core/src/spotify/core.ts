import { SpotifyDAL } from '@iuly/iuly-dal'
import { SpotifyDALInterface } from '@iuly/iuly-interfaces'
import { SpotifyToken } from '@iuly/iuly-models'

export class SpotifyCore {

  constructor(private spotifyDal: SpotifyDALInterface) { }

  async addSessionToken(token: SpotifyToken, sessionID: string) {
    await this.spotifyDal.addSessionToken(token, sessionID);
  }

  async getSessionToken(sessionID: string): Promise<string | null> {
    const token = await this.spotifyDal.getToken(sessionID);
    if (token) return token
    return null
  }

  async getSpotifyPlaylist(sessionID: string, playlistUrl: string) {
    const token: string | null = await this.spotifyDal.getToken(sessionID);
    if (token) {
      let playlist = await this.spotifyDal.getPlaylist(token, playlistUrl);
      if (playlist) {
        //work playlist
        //maybe parse the data we need, or we do that by query filtering on the get request?
      } else {
        //playlist is not valid login, return like undefined, if usecase receive undefined, controller should
        //say playlist is not valid
      }
    }
  }
}