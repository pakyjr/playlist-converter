/**
 * AppleToSpotifyStrategy
 *
 * STRATEGY PATTERN - Concrete Strategy
 *
 * Converts Apple Music playlists to Spotify.
 * Extends BaseConversionStrategy - only provides adapter and response parsing.
 */

import { PlaylistAdapter } from '@iuly/iuly-interfaces';
import { MusicProvider } from '@iuly/iuly-models';
import { BaseConversionStrategy } from './BaseConversionStrategy';
import { SpotifyPlaylistAdapter } from '../adapters/SpotifyPlaylistAdapter';

export class AppleToSpotifyStrategy extends BaseConversionStrategy {
  protected sourceProvider = MusicProvider.AppleMusic;
  protected targetProvider = MusicProvider.Spotify;

  private adapter = new SpotifyPlaylistAdapter();

  protected getAdapter(): PlaylistAdapter {
    return this.adapter;
  }

  protected getDescription(sourceName: string): string {
    return `Converted from Apple Music: ${sourceName}`;
  }

  protected extractCreatedPlaylist(
    result: any,
    sourceName: string
  ): { id: string; name: string; url?: string } | undefined {
    if (result?.id) {
      return {
        id: result.id,
        name: result.name || sourceName,
        url: result.external_urls?.spotify || `https://open.spotify.com/playlist/${result.id}`
      };
    }
    return undefined;
  }
}
