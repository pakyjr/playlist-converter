import { SpotifyPlaylist, SpotifyToken } from '@iuly/iuly-models'
import { CoreIndex } from '@iuly/iuly-core'

export class PlaylistUseCase {

  constructor(private core: CoreIndex) { }

  async sendPlaylistCheckAuth(sessionID: string): Promise<boolean> {
    //using the sessionID if the user has a token it means he logged in. 
    //TODO to add check apple music token
    let token: string | null = await this.core.spotifyCore.getSessionToken(sessionID);
    if (token) return true
    return false
  }

  async workSpotify(sessionID: string, playlistUrl: string): Promise<SpotifyPlaylist | null> {
    let playlist = await this.core.spotifyCore.getSpotifyPlaylist(sessionID, playlistUrl);
    if (playlist) return playlist
    return null
  }
}