/**
 * SpotifyToAppleStrategy
 *
 * STRATEGY PATTERN - Concrete Strategy
 *
 * Converts Spotify playlists to Apple Music.
 * Extends BaseConversionStrategy - only provides adapter and response parsing.
 */

import { PlaylistAdapter } from '@iuly/iuly-interfaces';
import { MusicProvider } from '@iuly/iuly-models';
import { BaseConversionStrategy } from './BaseConversionStrategy';
import { AppleMusicPlaylistAdapter } from '../adapters/AppleMusicPlaylistAdapter';

export class SpotifyToAppleStrategy extends BaseConversionStrategy {
  protected sourceProvider = MusicProvider.Spotify;
  protected targetProvider = MusicProvider.AppleMusic;

  private adapter = new AppleMusicPlaylistAdapter();

  protected getAdapter(): PlaylistAdapter {
    return this.adapter;
  }

  protected getDescription(sourceName: string): string {
    return `Converted from Spotify: ${sourceName}`;
  }

  protected extractCreatedPlaylist(
    result: any,
    sourceName: string
  ): { id: string; name: string; url?: string } | undefined {
    const playlistData = result?.data?.[0];
    if (playlistData) {
      return {
        id: playlistData.id,
        name: playlistData.attributes?.name || sourceName,
        url: `https://music.apple.com/library/playlist/${playlistData.id}`
      };
    }
    return undefined;
  }
}
