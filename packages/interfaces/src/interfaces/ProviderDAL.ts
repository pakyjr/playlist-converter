/**
 * ProviderDAL Interface
 *
 * Part of the ABSTRACT FACTORY PATTERN implementation.
 *
 * Generic Data Access Layer interface that all provider-specific
 * DALs must implement. This allows the factory to return
 * interchangeable DAL implementations.
 */

import { AuthToken } from '@iuly/iuly-models';

export interface ProviderDAL {
  /**
   * Get a playlist by ID
   * @param token - Authentication token
   * @param playlistId - The playlist identifier
   * @returns Raw playlist data from the provider
   */
  getPlaylist(token: string, playlistId: string): Promise<any | null>;

  /**
   * Search for tracks
   * @param token - Authentication token
   * @param query - Search query string
   * @returns Array of raw track results
   */
  search(token: string, query: string): Promise<any[]>;

  /**
   * Search for a track by ISRC (International Standard Recording Code)
   * @param token - Authentication token
   * @param isrc - The ISRC code
   * @returns Raw track data or null if not found
   */
  searchByISRC(token: string, isrc: string): Promise<any | null>;

  /**
   * Create a new playlist
   * @param token - Authentication token
   * @param name - Playlist name
   * @param description - Playlist description
   * @param trackIds - Array of track IDs to add
   * @param musicUserToken - Optional user token (required for Apple Music)
   * @returns Raw created playlist data
   */
  createPlaylist(
    token: string,
    name: string,
    description: string,
    trackIds: string[],
    musicUserToken?: string
  ): Promise<any>;

  /**
   * Store a session token
   * @param token - The auth token to store
   * @param sessionId - The session identifier
   */
  addSessionToken(token: AuthToken, sessionId: string): Promise<void>;

  /**
   * Retrieve a session token
   * @param sessionId - The session identifier
   * @returns The access token or null
   */
  getToken(sessionId: string): Promise<string | null>;

  /**
   * Retrieve a music user token (for Apple Music user library access)
   * @param sessionId - The session identifier
   * @returns The music user token or null (Spotify returns null)
   */
  getMusicUserToken?(sessionId: string): Promise<string | null>;
}
