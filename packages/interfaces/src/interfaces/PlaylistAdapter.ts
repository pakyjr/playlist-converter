/**
 * PlaylistAdapter Interface
 *
 * Part of the ADAPTER PATTERN implementation.
 *
 * Adapters convert provider-specific API responses into
 * the unified format used throughout the application.
 */

import { UnifiedPlaylist, UnifiedTrack, MusicProvider } from '@iuly/iuly-models';

export interface PlaylistAdapter {
  /**
   * Adapt a raw API response to a UnifiedPlaylist
   * @param rawResponse - The raw response from the provider's API
   * @returns A unified playlist object
   */
  adapt(rawResponse: any): UnifiedPlaylist;

  /**
   * Adapt a single track from raw format to UnifiedTrack
   * @param rawTrack - The raw track data from the provider
   * @returns A unified track object
   */
  adaptTrack(rawTrack: any): UnifiedTrack;

  /**
   * Get the provider this adapter handles
   * @returns The music provider type
   */
  getProvider(): MusicProvider;
}
