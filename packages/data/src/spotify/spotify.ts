import { redisClient } from '@iuly/iuly-utils'
import { SpotifyDALInterface } from '@iuly/iuly-interfaces'
import { SpotifyToken } from '@iuly/iuly-models'

export class SpotifyDAL implements SpotifyDALInterface {

  constructor() { }

  async addSessionToken(token: SpotifyToken, sessionId: string) {
    const redisKey = `spotifyToken:${sessionId}`;
    await redisClient.set(redisKey, token.access_token, {
      EX: token.expires_in
    });
  }

  async getToken(sessionId: string): Promise<string | null> {
    const redisKey = `spotifyToken:${sessionId}`
    const token: string | null = await redisClient.get(redisKey);
    if (token !== null) return token
    return null
  }
}