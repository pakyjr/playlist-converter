/**
 * SpotifyToAppleStrategy
 *
 * STRATEGY PATTERN - Concrete Strategy
 *
 * Converts Spotify playlists to Apple Music.
 * Uses ISRC matching first (most accurate), then falls back to search.
 */

import { ProviderDAL } from '@iuly/iuly-interfaces';
import { UnifiedPlaylist, UnifiedTrack, ConversionResult, MusicProvider } from '@iuly/iuly-models';
import { BaseConversionStrategy } from './BaseConversionStrategy';
import { AppleMusicPlaylistAdapter } from '../adapters/AppleMusicPlaylistAdapter';

export class SpotifyToAppleStrategy extends BaseConversionStrategy {
  protected sourceProvider = MusicProvider.Spotify;
  protected targetProvider = MusicProvider.AppleMusic;

  private adapter: AppleMusicPlaylistAdapter;

  constructor() {
    super();
    this.adapter = new AppleMusicPlaylistAdapter();
  }

  async convert(
    source: UnifiedPlaylist,
    targetDAL: ProviderDAL,
    targetToken: string
  ): Promise<ConversionResult> {
    const matchedTracks: UnifiedTrack[] = [];
    const unmatchedTracks: UnifiedTrack[] = [];

    console.log(`[SpotifyToApple] Converting playlist: ${source.name} (${source.tracks.length} tracks)`);

    for (const track of source.tracks) {
      // Try ISRC match first (most reliable)
      let match = await this.matchByISRC(track, targetDAL, targetToken, this.adapter);

      // Fall back to search if no ISRC match
      if (!match) {
        match = await this.matchBySearch(track, targetDAL, targetToken, this.adapter);
      }

      if (match) {
        matchedTracks.push(match);
        console.log(`  [MATCH] ${track.name} -> ${match.name}`);
      } else {
        unmatchedTracks.push(track);
        console.log(`  [NO MATCH] ${track.name}`);
      }
    }

    console.log(`[SpotifyToApple] Complete: ${matchedTracks.length}/${source.tracks.length} matched`);

    return this.createResult(source, matchedTracks, unmatchedTracks);
  }
}
