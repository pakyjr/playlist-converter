/**
 * ConversionStrategy Interface
 *
 * Part of the STRATEGY PATTERN implementation.
 *
 * Defines the contract for playlist conversion algorithms.
 * Each concrete strategy handles conversion between a specific
 * pair of music providers (e.g., Spotify → Apple Music).
 */

import {
  UnifiedPlaylist,
  UnifiedTrack,
  ConversionResult,
  MusicProvider
} from '@iuly/iuly-models';
import { ProviderDAL } from './ProviderDAL';

export interface ConversionStrategy {
  /**
   * Convert a playlist from source format to target provider
   * @param source - The unified playlist to convert
   * @param targetDAL - DAL for the target provider (to search for matching tracks)
   * @param targetToken - Authentication token for the target provider
   * @returns Conversion result with matched and unmatched tracks
   */
  convert(
    source: UnifiedPlaylist,
    targetDAL: ProviderDAL,
    targetToken: string
  ): Promise<ConversionResult>;

  /**
   * Get the source provider this strategy converts FROM
   * @returns The source music provider
   */
  getSourceProvider(): MusicProvider;

  /**
   * Get the target provider this strategy converts TO
   * @returns The target music provider
   */
  getTargetProvider(): MusicProvider;

  /**
   * Get a unique key for this strategy (e.g., "Spotify->AppleMusic")
   * @returns Strategy identifier string
   */
  getKey(): string;
}
