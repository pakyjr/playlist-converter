/**
 * AppleToSpotifyStrategy
 *
 * STRATEGY PATTERN - Concrete Strategy
 *
 * Converts Apple Music playlists to Spotify.
 * Uses ISRC matching first (most accurate), then falls back to search.
 */

import { ProviderDAL } from '@iuly/iuly-interfaces';
import { UnifiedPlaylist, UnifiedTrack, ConversionResult, MusicProvider } from '@iuly/iuly-models';
import { BaseConversionStrategy } from './BaseConversionStrategy';
import { SpotifyPlaylistAdapter } from '../adapters/SpotifyPlaylistAdapter';

export class AppleToSpotifyStrategy extends BaseConversionStrategy {
  protected sourceProvider = MusicProvider.AppleMusic;
  protected targetProvider = MusicProvider.Spotify;

  private adapter: SpotifyPlaylistAdapter;

  constructor() {
    super();
    this.adapter = new SpotifyPlaylistAdapter();
  }

  async convert(
    source: UnifiedPlaylist,
    targetDAL: ProviderDAL,
    targetToken: string
  ): Promise<ConversionResult> {
    const matchedTracks: UnifiedTrack[] = [];
    const unmatchedTracks: UnifiedTrack[] = [];

    console.log(`[AppleToSpotify] Converting playlist: ${source.name} (${source.tracks.length} tracks)`);

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

    console.log(`[AppleToSpotify] Complete: ${matchedTracks.length}/${source.tracks.length} matched`);

    return this.createResult(source, matchedTracks, unmatchedTracks);
  }
}
