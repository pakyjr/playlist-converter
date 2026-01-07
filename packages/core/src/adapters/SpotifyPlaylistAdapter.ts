/**
 * SpotifyPlaylistAdapter
 *
 * ADAPTER PATTERN - Concrete Adapter
 *
 * Converts Spotify API responses into the unified format
 * used throughout the application.
 */

import { PlaylistAdapter } from '@iuly/iuly-interfaces';
import {
  UnifiedPlaylist,
  UnifiedTrack,
  UnifiedArtist,
  UnifiedAlbum,
  MusicProvider
} from '@iuly/iuly-models';

export class SpotifyPlaylistAdapter implements PlaylistAdapter {

  getProvider(): MusicProvider {
    return MusicProvider.Spotify;
  }

  /**
   * Adapt a raw Spotify playlist response to UnifiedPlaylist
   *
   * Spotify API Response Structure:
   * {
   *   id: string,
   *   name: string,
   *   description: string,
   *   public: boolean,
   *   images: [{ url: string }],
   *   tracks: {
   *     items: [{ track: { ... } }]
   *   }
   * }
   */
  adapt(rawResponse: any): UnifiedPlaylist {
    const tracks: UnifiedTrack[] = rawResponse.tracks.items
      .filter((item: any) => item.track !== null) // Handle removed tracks
      .map((item: any) => this.adaptTrack(item.track));

    return {
      id: `unified-spotify-${rawResponse.id}`,
      name: rawResponse.name,
      description: rawResponse.description || '',
      tracks,
      imageUrl: rawResponse.images?.[0]?.url,
      isPublic: rawResponse.public ?? false,
      sourceProvider: MusicProvider.Spotify,
      originalId: rawResponse.id,
      totalTracks: tracks.length
    };
  }

  /**
   * Adapt a raw Spotify track to UnifiedTrack
   *
   * Spotify Track Structure:
   * {
   *   id: string,
   *   name: string,
   *   duration_ms: number,
   *   artists: [{ id, name, uri }],
   *   album: { id, name, artists, release_date, images },
   *   external_ids: { isrc: string },
   *   preview_url: string
   * }
   */
  adaptTrack(rawTrack: any): UnifiedTrack {
    return {
      id: `unified-spotify-track-${rawTrack.id}`,
      name: rawTrack.name,
      artists: this.extractArtists(rawTrack.artists),
      album: this.extractAlbum(rawTrack.album),
      durationMs: rawTrack.duration_ms,
      isrc: rawTrack.external_ids?.isrc,
      sourceProvider: MusicProvider.Spotify,
      originalId: rawTrack.id,
      previewUrl: rawTrack.preview_url
    };
  }

  private extractArtists(rawArtists: any[]): UnifiedArtist[] {
    if (!rawArtists) return [];

    return rawArtists.map(artist => ({
      id: `unified-spotify-artist-${artist.id}`,
      name: artist.name,
      sourceProvider: MusicProvider.Spotify,
      originalId: artist.id
    }));
  }

  private extractAlbum(rawAlbum: any): UnifiedAlbum {
    if (!rawAlbum) {
      return {
        id: 'unknown',
        name: 'Unknown Album',
        artists: [],
        sourceProvider: MusicProvider.Spotify,
        originalId: 'unknown'
      };
    }

    return {
      id: `unified-spotify-album-${rawAlbum.id}`,
      name: rawAlbum.name,
      artists: this.extractArtists(rawAlbum.artists),
      releaseDate: rawAlbum.release_date,
      imageUrl: rawAlbum.images?.[0]?.url,
      sourceProvider: MusicProvider.Spotify,
      originalId: rawAlbum.id
    };
  }
}
