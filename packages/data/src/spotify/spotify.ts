import { redisClient, NetworkHandler } from '@iuly/iuly-utils'
import { SpotifyDALInterface, ProviderDAL } from '@iuly/iuly-interfaces'
import { SpotifyToken, AuthToken } from '@iuly/iuly-models'

/**
 * SpotifyDAL
 *
 * Data Access Layer for Spotify Web API.
 * Implements both the legacy SpotifyDALInterface and new ProviderDAL interface.
 */
export class SpotifyDAL implements SpotifyDALInterface, ProviderDAL {
  private networkHandler: NetworkHandler;
  private readonly SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

  constructor() {
    this.networkHandler = new NetworkHandler()
  }

  // Legacy method - kept for backwards compatibility
  async addSessionToken(token: SpotifyToken | AuthToken, sessionId: string): Promise<void> {
    const redisKey = this.buildSpotifyTokenKey(sessionId);
    const accessToken = 'access_token' in token ? token.access_token : token.accessToken;
    const expiresIn = 'expires_in' in token ? token.expires_in : token.expiresIn;

    await redisClient.set(redisKey, accessToken, {
      EX: expiresIn
    });
  }

  async getToken(sessionId: string): Promise<string | null> {
    const redisKey = this.buildSpotifyTokenKey(sessionId);
    const token: string | null = await redisClient.get(redisKey);
    if (token !== null) return token
    return null
  }

  async getPlaylist(token: string, playlistId: string): Promise<any | null> {
    const headers = this.authHeaderUsingToken(token);
    const endpoint = `${this.SPOTIFY_API_BASE}/playlists/${playlistId}`;
    try {
      const response = await this.networkHandler.get(endpoint, { headers });
      return response.data
    } catch (error) {
      return null
    }
  }

  /**
   * Search for tracks on Spotify
   * Part of ProviderDAL interface
   */
  async search(token: string, query: string): Promise<any[]> {
    const headers = this.authHeaderUsingToken(token);
    const endpoint = `${this.SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
    try {
      const response = await this.networkHandler.get(endpoint, { headers });
      return response.data?.tracks?.items || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Search for a track by ISRC
   * Part of ProviderDAL interface
   */
  async searchByISRC(token: string, isrc: string): Promise<any | null> {
    const headers = this.authHeaderUsingToken(token);
    const endpoint = `${this.SPOTIFY_API_BASE}/search?q=isrc:${isrc}&type=track&limit=1`;
    try {
      const response = await this.networkHandler.get(endpoint, { headers });
      const tracks = response.data?.tracks?.items;
      return tracks && tracks.length > 0 ? tracks[0] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create a new playlist on Spotify
   * Part of ProviderDAL interface
   */
  async createPlaylist(
    token: string,
    name: string,
    description: string,
    trackIds: string[]
  ): Promise<any> {
    const headers = this.authHeaderUsingToken(token);

    try {
      // First, get the user's ID
      const userResponse = await this.networkHandler.get(
        `${this.SPOTIFY_API_BASE}/me`,
        { headers }
      );
      const userId = userResponse.data.id;

      // Create the playlist
      const createResponse = await this.networkHandler.post(
        `${this.SPOTIFY_API_BASE}/users/${userId}/playlists`,
        { name, description, public: false },
        { headers: { ...headers, 'Content-Type': 'application/json' } }
      );
      const playlistId = createResponse.data.id;

      // Add tracks to the playlist (Spotify uses URIs)
      if (trackIds.length > 0) {
        const uris = trackIds.map(id => `spotify:track:${id}`);
        await this.networkHandler.post(
          `${this.SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
          { uris },
          { headers: { ...headers, 'Content-Type': 'application/json' } }
        );
      }

      return createResponse.data;
    } catch (error) {
      console.error('Failed to create Spotify playlist:', error);
      throw error;
    }
  }

  private buildSpotifyTokenKey(sessionId: string): string {
    return `spotifyToken:${sessionId}`
  }

  private authHeaderUsingToken(token: string): { Authorization: string, Accept: string } {
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  }
}