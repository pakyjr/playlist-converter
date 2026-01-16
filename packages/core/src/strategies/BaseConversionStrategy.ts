/**
 * BaseConversionStrategy
 *
 * STRATEGY PATTERN - Abstract base for conversion strategies
 *
 * Uses Template Method pattern - common conversion logic here,
 * subclasses provide adapter and response parsing.
 */

import { ConversionStrategy, ProviderDAL, PlaylistAdapter } from '@iuly/iuly-interfaces';
import {
  UnifiedPlaylist,
  UnifiedTrack,
  ConversionResult,
  MusicProvider
} from '@iuly/iuly-models';
import { delay, createLogger, Logger } from '@iuly/iuly-utils';

export abstract class BaseConversionStrategy implements ConversionStrategy {

  protected abstract sourceProvider: MusicProvider;
  protected abstract targetProvider: MusicProvider;

  /** Get the adapter for the target provider */
  protected abstract getAdapter(): PlaylistAdapter;

  /** Get description for the new playlist */
  protected abstract getDescription(sourceName: string): string;

  /** Extract created playlist info from API response (provider-specific) */
  protected abstract extractCreatedPlaylist(
    result: any,
    sourceName: string
  ): { id: string; name: string; url?: string } | undefined;

  /**
   * Template method - handles the common conversion flow
   */
  async convert(
    source: UnifiedPlaylist,
    targetDAL: ProviderDAL,
    targetToken: string,
    musicUserToken?: string,
    delayMs: number = 50,
    onProgress?: (current: number, total: number) => void
  ): Promise<ConversionResult> {
    const matchedTracks: UnifiedTrack[] = [];
    const unmatchedTracks: UnifiedTrack[] = [];
    const totalTracks = source.tracks.length;
    const adapter = this.getAdapter();
    const log = createLogger(this.getKey());

    log.info(`Converting playlist: ${source.name} (${totalTracks} tracks, ${delayMs}ms delay)`);

    // Match each track
    for (let i = 0; i < source.tracks.length; i++) {
      const track = source.tracks[i];

      if (onProgress) {
        onProgress(i + 1, totalTracks);
      }

      // Try ISRC match first, then fall back to search
      let match = await this.matchByISRC(track, targetDAL, targetToken, adapter);
      if (!match) {
        match = await this.matchBySearch(track, targetDAL, targetToken, adapter);
      }

      if (match) {
        matchedTracks.push(match);
        log.match(track.name, match.name);
      } else {
        unmatchedTracks.push(track);
        log.noMatch(track.name);
      }

      // Rate limiting delay
      if (i < source.tracks.length - 1 && delayMs > 0) {
        await delay(delayMs);
      }
    }

    log.info(`Complete: ${matchedTracks.length}/${totalTracks} matched`);

    // Create playlist with matched tracks
    const createdPlaylist = await this.createPlaylistOnTarget(
      source,
      matchedTracks,
      targetDAL,
      targetToken,
      musicUserToken,
      log
    );

    return this.createResult(source, matchedTracks, unmatchedTracks, createdPlaylist);
  }

  /**
   * Create playlist on target provider with matched tracks
   */
  private async createPlaylistOnTarget(
    source: UnifiedPlaylist,
    matchedTracks: UnifiedTrack[],
    targetDAL: ProviderDAL,
    targetToken: string,
    musicUserToken: string | undefined,
    log: Logger
  ): Promise<{ id: string; name: string; url?: string } | undefined> {
    if (matchedTracks.length === 0) {
      return undefined;
    }

    // Filter out tracks without valid IDs
    const validTracks = matchedTracks.filter(t => t.originalId);
    const invalidCount = matchedTracks.length - validTracks.length;

    if (invalidCount > 0) {
      log.warn(`${invalidCount} matched tracks have no valid originalId, skipping`);
    }

    if (validTracks.length === 0) {
      log.warn(`No valid track IDs to add to playlist`);
      return undefined;
    }

    const trackIds = validTracks.map(t => t.originalId);
    const description = this.getDescription(source.name);

    try {
      const result = await targetDAL.createPlaylist(
        targetToken,
        source.name,
        description,
        trackIds,
        musicUserToken
      );

      const createdPlaylist = this.extractCreatedPlaylist(result, source.name);
      if (createdPlaylist) {
        log.info(`Created playlist: ${createdPlaylist.name}`);
      }
      return createdPlaylist;
    } catch (err: any) {
      log.error(`Failed to create playlist: ${err.message}`);
      return undefined;
    }
  }

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
    unmatchedTracks: UnifiedTrack[],
    createdPlaylist?: { id: string; name: string; url?: string }
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
      targetProvider: this.targetProvider,
      createdPlaylist
    };
  }
}
