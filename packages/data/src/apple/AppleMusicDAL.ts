/**
 * AppleMusicDAL
 *
 * Data Access Layer for Apple Music API.
 * Uses real Apple Music API when developer token is available,
 * falls back to mock data for demo purposes.
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
    try {
      // For library playlists, we need the music user token
      const endpoint = musicUserToken
        ? `${this.APPLE_API_BASE}/me/library/playlists/${playlistId}?include=tracks`
        : `${this.APPLE_API_BASE}/catalog/${this.DEFAULT_STOREFRONT}/playlists/${playlistId}?include=tracks`;

      const response = await this.networkHandler.get(endpoint, {
        headers: this.buildHeaders(token, musicUserToken)
      });

      return response.data;
    } catch (error: any) {
      console.error('[AppleMusicDAL] getPlaylist error:', error.message);
      // Fall back to mock data for demo
      return this.getMockPlaylist(playlistId);
    }
  }

  async search(token: string, query: string): Promise<any[]> {
    try {
      const endpoint = `${this.APPLE_API_BASE}/catalog/${this.DEFAULT_STOREFRONT}/search?term=${encodeURIComponent(query)}&types=songs&limit=10`;

      const response = await this.networkHandler.get(endpoint, {
        headers: this.buildHeaders(token)
      });

      return response.data?.results?.songs?.data || [];
    } catch (error: any) {
      console.error('[AppleMusicDAL] search error:', error.message);
      return this.getMockSearchResults(query);
    }
  }

  async searchByISRC(token: string, isrc: string): Promise<any | null> {
    try {
      const endpoint = `${this.APPLE_API_BASE}/catalog/${this.DEFAULT_STOREFRONT}/songs?filter[isrc]=${isrc}`;

      const response = await this.networkHandler.get(endpoint, {
        headers: this.buildHeaders(token)
      });

      const songs = response.data?.data;
      return songs && songs.length > 0 ? songs[0] : null;
    } catch (error: any) {
      console.error('[AppleMusicDAL] searchByISRC error:', error.message);
      return this.getMockTrackByISRC(isrc);
    }
  }

  async createPlaylist(
    token: string,
    name: string,
    description: string,
    trackIds: string[],
    musicUserToken?: string
  ): Promise<any> {
    if (!musicUserToken) {
      console.warn('[AppleMusicDAL] createPlaylist requires musicUserToken, using mock');
      return this.getMockCreatedPlaylist(name, description, trackIds);
    }

    try {
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
    } catch (error: any) {
      console.error('[AppleMusicDAL] createPlaylist error:', error.message);
      return this.getMockCreatedPlaylist(name, description, trackIds);
    }
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

  // ============================================================
  // MOCK DATA - Remove when real API integration is ready
  // ============================================================

  private getMockPlaylist(playlistId: string): any {
    return {
      data: [{
        id: playlistId,
        type: 'playlists',
        attributes: {
          name: 'Mock Apple Music Playlist',
          description: { standard: 'A mock playlist for testing the design patterns' },
          artwork: {
            url: 'https://via.placeholder.com/300',
            width: 300,
            height: 300
          },
          isPublic: true
        },
        relationships: {
          tracks: {
            data: [
              this.createMockAppleTrack('1', 'Bohemian Rhapsody', 'Queen', 'A Night at the Opera', 'GBUM71029604'),
              this.createMockAppleTrack('2', 'Hotel California', 'Eagles', 'Hotel California', 'USEE10100086'),
              this.createMockAppleTrack('3', 'Stairway to Heaven', 'Led Zeppelin', 'Led Zeppelin IV', 'USAT20400001'),
              this.createMockAppleTrack('4', 'Imagine', 'John Lennon', 'Imagine', 'GBAYE7100006'),
              this.createMockAppleTrack('5', 'Smells Like Teen Spirit', 'Nirvana', 'Nevermind', 'USGF19942501')
            ]
          }
        }
      }]
    };
  }

  private createMockAppleTrack(
    id: string,
    name: string,
    artistName: string,
    albumName: string,
    isrc: string
  ): any {
    return {
      id: `apple-track-${id}`,
      type: 'songs',
      attributes: {
        name,
        artistName,
        albumName,
        durationInMillis: 240000 + Math.floor(Math.random() * 120000),
        isrc,
        artwork: {
          url: 'https://via.placeholder.com/300',
          width: 300,
          height: 300
        },
        previews: [{ url: 'https://example.com/preview.mp3' }],
        releaseDate: '1975-01-01'
      }
    };
  }

  private getMockSearchResults(query: string): any[] {
    // Simulate search results based on query
    const mockResults = [
      this.createMockAppleTrack('search-1', `${query} - Result 1`, 'Various Artists', 'Greatest Hits', 'MOCK00000001'),
      this.createMockAppleTrack('search-2', `${query} - Result 2`, 'Various Artists', 'Greatest Hits', 'MOCK00000002'),
    ];
    return mockResults;
  }

  private getMockTrackByISRC(isrc: string): any | null {
    // Mock ISRC lookup - in real implementation this would search Apple's catalog
    const mockTracks: { [key: string]: any } = {
      'GBUM71029604': this.createMockAppleTrack('isrc-1', 'Bohemian Rhapsody', 'Queen', 'A Night at the Opera', 'GBUM71029604'),
      'USEE10100086': this.createMockAppleTrack('isrc-2', 'Hotel California', 'Eagles', 'Hotel California', 'USEE10100086'),
      'USAT20400001': this.createMockAppleTrack('isrc-3', 'Stairway to Heaven', 'Led Zeppelin', 'Led Zeppelin IV', 'USAT20400001'),
      'GBAYE7100006': this.createMockAppleTrack('isrc-4', 'Imagine', 'John Lennon', 'Imagine', 'GBAYE7100006'),
      'USGF19942501': this.createMockAppleTrack('isrc-5', 'Smells Like Teen Spirit', 'Nirvana', 'Nevermind', 'USGF19942501'),
    };

    return mockTracks[isrc] || null;
  }

  private getMockCreatedPlaylist(name: string, description: string, trackIds: string[]): any {
    return {
      data: [{
        id: `created-playlist-${Date.now()}`,
        type: 'playlists',
        attributes: {
          name,
          description: { standard: description },
          isPublic: false
        },
        relationships: {
          tracks: {
            data: trackIds.map((id, index) =>
              this.createMockAppleTrack(`created-${index}`, `Track ${index + 1}`, 'Artist', 'Album', `MOCK${id}`)
            )
          }
        }
      }]
    };
  }
}
