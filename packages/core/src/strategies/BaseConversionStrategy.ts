/**
 * BaseConversionStrategy
 *
 * STRATEGY PATTERN - Abstract base for conversion strategies
 *
 * Provides common functionality for all conversion strategies,
 * such as track matching algorithms.
 */

import { ConversionStrategy, ProviderDAL, PlaylistAdapter } from '@iuly/iuly-interfaces';
import {
  UnifiedPlaylist,
  UnifiedTrack,
  ConversionResult,
  MusicProvider
} from '@iuly/iuly-models';

export abstract class BaseConversionStrategy implements ConversionStrategy {

  protected abstract sourceProvider: MusicProvider;
  protected abstract targetProvider: MusicProvider;

  abstract convert(
    source: UnifiedPlaylist,
    targetDAL: ProviderDAL,
    targetToken: string
  ): Promise<ConversionResult>;

  getSourceProvider(): MusicProvider {
    return this.sourceProvider;
  }

  getTargetProvider(): MusicProvider {
    return this.targetProvider;
  }

  getKey(): string {
    return `${this.sourceProvider}->${this.targetProvider}`;
  }

  /**
   * Try to match a track by ISRC (most reliable method)
   */
  protected async matchByISRC(
    track: UnifiedTrack,
    targetDAL: ProviderDAL,
    targetToken: string,
    targetAdapter: PlaylistAdapter
  ): Promise<UnifiedTrack | null> {
    if (!track.isrc) return null;

    const rawMatch = await targetDAL.searchByISRC(targetToken, track.isrc);
    if (rawMatch) {
      return targetAdapter.adaptTrack(rawMatch);
    }
    return null;
  }

  /**
   * Try to match a track by name and artist search
   */
  protected async matchBySearch(
    track: UnifiedTrack,
    targetDAL: ProviderDAL,
    targetToken: string,
    targetAdapter: PlaylistAdapter
  ): Promise<UnifiedTrack | null> {
    const artistName = track.artists[0]?.name || '';
    const query = `${track.name} ${artistName}`.trim();

    const rawResults = await targetDAL.search(targetToken, query);
    if (rawResults.length === 0) return null;

    // Adapt results and find best match
    const adaptedResults = rawResults.map(r => targetAdapter.adaptTrack(r));
    return this.findBestMatch(track, adaptedResults);
  }

  /**
   * Find the best matching track from search results
   * Uses simple string similarity scoring
   */
  protected findBestMatch(
    original: UnifiedTrack,
    candidates: UnifiedTrack[]
  ): UnifiedTrack | null {
    if (candidates.length === 0) return null;

    let bestMatch: UnifiedTrack | null = null;
    let bestScore = 0;

    for (const candidate of candidates) {
      const score = this.calculateMatchScore(original, candidate);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    // Only accept matches with reasonable confidence
    if (bestScore >= 0.6) {
      return bestMatch;
    }

    return null;
  }

  /**
   * Calculate a similarity score between two tracks (0-1)
   */
  protected calculateMatchScore(original: UnifiedTrack, candidate: UnifiedTrack): number {
    let score = 0;

    // Name similarity (weight: 0.4)
    const nameSimilarity = this.stringSimilarity(
      original.name.toLowerCase(),
      candidate.name.toLowerCase()
    );
    score += nameSimilarity * 0.4;

    // Artist similarity (weight: 0.4)
    const originalArtist = original.artists[0]?.name.toLowerCase() || '';
    const candidateArtist = candidate.artists[0]?.name.toLowerCase() || '';
    const artistSimilarity = this.stringSimilarity(originalArtist, candidateArtist);
    score += artistSimilarity * 0.4;

    // Duration similarity (weight: 0.2) - within 5 seconds is perfect
    const durationDiff = Math.abs(original.durationMs - candidate.durationMs);
    const durationSimilarity = Math.max(0, 1 - (durationDiff / 10000));
    score += durationSimilarity * 0.2;

    return score;
  }

  /**
   * Simple string similarity using Levenshtein-like approach
   */
  protected stringSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    // Check if one contains the other
    if (a.includes(b) || b.includes(a)) {
      return 0.9;
    }

    // Simple character overlap ratio
    const aChars = new Set(a.split(''));
    const bChars = new Set(b.split(''));
    let overlap = 0;
    for (const char of aChars) {
      if (bChars.has(char)) overlap++;
    }

    return overlap / Math.max(aChars.size, bChars.size);
  }

  /**
   * Create a ConversionResult from matched and unmatched tracks
   */
  protected createResult(
    originalPlaylist: UnifiedPlaylist,
    matchedTracks: UnifiedTrack[],
    unmatchedTracks: UnifiedTrack[]
  ): ConversionResult {
    const totalTracks = originalPlaylist.tracks.length;
    const matchRate = totalTracks > 0
      ? matchedTracks.length / totalTracks
      : 0;

    return {
      originalPlaylist,
      matchedTracks,
      unmatchedTracks,
      matchRate,
      targetProvider: this.targetProvider
    };
  }
}
