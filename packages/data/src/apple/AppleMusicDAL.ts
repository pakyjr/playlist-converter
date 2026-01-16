/**
 * AppleMusicDAL
 *
 * Data Access Layer for Apple Music API.
 * Requires valid developer token for API access.
 * createPlaylist() also requires musicUserToken for user library access.
 */

import { ProviderDAL } from '@iuly/iuly-interfaces';
import { AuthToken } from '@iuly/iuly-models';
import { getRedisClient, NetworkHandler } from '@iuly/iuly-utils';

export class AppleMusicDAL implements ProviderDAL {

  private readonly REDIS_KEY_PREFIX = 'appleMusicToken:';
  private readonly APPLE_API_BASE = 'https://api.music.apple.com/v1';
  private readonly DEFAULT_STOREFRONT = 'us'; // Default to US storefront
  private networkHandler: NetworkHandler;

  constructor() {
    this.networkHandler = new NetworkHandler();
  }

  async addSessionToken(token: AuthToken, sessionId: string): Promise<void> {
    const client = await getRedisClient();
    if (!client) {
      console.log('[AppleMusicDAL] Redis not available, token not persisted');
      return;
    }

    const redisKey = this.buildTokenKey(sessionId);
    await client.set(redisKey, token.accessToken, {
      EX: token.expiresIn
    });

    // Also store the music user token if present
    if (token.scope?.startsWith('musicUserToken:')) {
      const musicUserToken = token.scope.replace('musicUserToken:', '');
      await client.set(`${redisKey}:userToken`, musicUserToken, {
        EX: token.expiresIn
      });
    }
  }

  async getToken(sessionId: string): Promise<string | null> {
    const client = await getRedisClient();
    if (!client) {
      return null;
    }

    const redisKey = this.buildTokenKey(sessionId);
    return client.get(redisKey);
  }

  async getMusicUserToken(sessionId: string): Promise<string | null> {
    const client = await getRedisClient();
    if (!client) {
      return null;
    }

    const redisKey = this.buildTokenKey(sessionId);
    return client.get(`${redisKey}:userToken`);
  }

  async getPlaylist(token: string, playlistId: string, musicUserToken?: string): Promise<any | null> {
    // For library playlists, we need the music user token
    const endpoint = musicUserToken
      ? `${this.APPLE_API_BASE}/me/library/playlists/${playlistId}?include=tracks`
      : `${this.APPLE_API_BASE}/catalog/${this.DEFAULT_STOREFRONT}/playlists/${playlistId}?include=tracks`;

    const response = await this.networkHandler.get(endpoint, {
      headers: this.buildHeaders(token, musicUserToken)
    });

    return response.data;
  }

  async search(token: string, query: string): Promise<any[]> {
    const endpoint = `${this.APPLE_API_BASE}/catalog/${this.DEFAULT_STOREFRONT}/search?term=${encodeURIComponent(query)}&types=songs&limit=10`;

    const response = await this.networkHandler.get(endpoint, {
      headers: this.buildHeaders(token)
    });

    return response.data?.results?.songs?.data || [];
  }

  async searchByISRC(token: string, isrc: string): Promise<any | null> {
    const endpoint = `${this.APPLE_API_BASE}/catalog/${this.DEFAULT_STOREFRONT}/songs?filter[isrc]=${isrc}`;

    const response = await this.networkHandler.get(endpoint, {
      headers: this.buildHeaders(token)
    });

    const songs = response.data?.data;
    return songs && songs.length > 0 ? songs[0] : null;
  }

  async createPlaylist(
    token: string,
    name: string,
    description: string,
    trackIds: string[],
    musicUserToken?: string
  ): Promise<any> {
    if (!musicUserToken) {
      throw new Error('Apple Music createPlaylist requires musicUserToken for user library access');
    }

    const endpoint = `${this.APPLE_API_BASE}/me/library/playlists`;

    const body = {
      attributes: {
        name,
        description
      },
      relationships: {
        tracks: {
          data: trackIds.map(id => ({
            id,
            type: 'songs'
          }))
        }
      }
    };

    const response = await this.networkHandler.post(endpoint, body, {
      headers: {
        ...this.buildHeaders(token, musicUserToken),
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  }

  private buildHeaders(developerToken: string, musicUserToken?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${developerToken}`,
      'Accept': 'application/json'
    };

    if (musicUserToken) {
      headers['Music-User-Token'] = musicUserToken;
    }

    return headers;
  }

  private buildTokenKey(sessionId: string): string {
    return `${this.REDIS_KEY_PREFIX}${sessionId}`;
  }
}
