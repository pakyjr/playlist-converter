/**
 * AppleMusicDAL
 *
 * Data Access Layer for Apple Music API.
 * Currently uses MOCK DATA for development/demo purposes.
 *
 * To use real API:
 * 1. Set APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY_PATH in .env
 * 2. Remove USE_MOCK_DATA flag
 */

import { ProviderDAL } from '@iuly/iuly-interfaces';
import { AuthToken } from '@iuly/iuly-models';
import { redisClient } from '@iuly/iuly-utils';

// Set to false when real Apple credentials are available
const USE_MOCK_DATA = true;

export class AppleMusicDAL implements ProviderDAL {

  private readonly REDIS_KEY_PREFIX = 'appleMusicToken:';

  async addSessionToken(token: AuthToken, sessionId: string): Promise<void> {
    const redisKey = this.buildTokenKey(sessionId);
    await redisClient.set(redisKey, token.accessToken, {
      EX: token.expiresIn
    });
  }

  async getToken(sessionId: string): Promise<string | null> {
    const redisKey = this.buildTokenKey(sessionId);
    return redisClient.get(redisKey);
  }

  async getPlaylist(token: string, playlistId: string): Promise<any | null> {
    if (USE_MOCK_DATA) {
      return this.getMockPlaylist(playlistId);
    }

    // Real implementation would call Apple Music API
    // const response = await this.networkHandler.get(
    //   `https://api.music.apple.com/v1/me/library/playlists/${playlistId}`,
    //   { headers: this.buildHeaders(token) }
    // );
    // return response.data;

    return null;
  }

  async search(token: string, query: string): Promise<any[]> {
    if (USE_MOCK_DATA) {
      return this.getMockSearchResults(query);
    }

    // Real implementation would call Apple Music API
    return [];
  }

  async searchByISRC(token: string, isrc: string): Promise<any | null> {
    if (USE_MOCK_DATA) {
      return this.getMockTrackByISRC(isrc);
    }

    // Real implementation would call:
    // https://api.music.apple.com/v1/catalog/{storefront}/songs?filter[isrc]={isrc}
    return null;
  }

  async createPlaylist(
    token: string,
    name: string,
    description: string,
    trackIds: string[]
  ): Promise<any> {
    if (USE_MOCK_DATA) {
      return this.getMockCreatedPlaylist(name, description, trackIds);
    }

    // Real implementation would POST to Apple Music API
    return null;
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
