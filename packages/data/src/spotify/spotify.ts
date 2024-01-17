import { redisClient, NetworkHandler } from '@iuly/iuly-utils'
import { SpotifyDALInterface } from '@iuly/iuly-interfaces'
import { SpotifyToken } from '@iuly/iuly-models'

export class SpotifyDAL implements SpotifyDALInterface {
  private networkHandler: NetworkHandler;

  constructor() {
    this.networkHandler = new NetworkHandler()
  }

  async addSessionToken(token: SpotifyToken, sessionId: string): Promise<void> {
    const redisKey = this.buildSpotifyTokenKey(sessionId);
    await redisClient.set(redisKey, token.access_token, {
      EX: token.expires_in
    });
  }

  async getToken(sessionId: string): Promise<string | null> {
    const redisKey = this.buildSpotifyTokenKey(sessionId);
    const token: string | null = await redisClient.get(redisKey);
    if (token !== null) return token
    return null
  }

  async getPlaylist(token: string, playlistUrl: string): Promise<any> {
    const header = this.authHeaderUsingToken(token);
    const playlistID: string = this.getIdFromPlaylistUrl(playlistUrl);
    const getPlaylistEndpoint: string = `https://api.spotify.com/v1/playlists/${playlistID}`;
    const playlist = await this.networkHandler.get(getPlaylistEndpoint, {
      headers: {
        ...header
      }
    });
    return playlist
  }

  private buildSpotifyTokenKey(sessionId: string): string {
    return `spotifyToken:${sessionId}`
  }

  private authHeaderUsingToken(token: string): { Authorization: string } {
    return {
      Authorization: `Bearer ${token}`
    }
  }

  private getIdFromPlaylistUrl(playlistUrl: string): string {
    let parts = playlistUrl.split('/');
    return parts[parts.length - 1];

  }
}