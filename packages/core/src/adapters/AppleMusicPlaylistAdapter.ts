/**
 * AppleMusicPlaylistAdapter
 *
 * ADAPTER PATTERN - Concrete Adapter
 *
 * Converts Apple Music API responses into the unified format
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

export class AppleMusicPlaylistAdapter implements PlaylistAdapter {

  getProvider(): MusicProvider {
    return MusicProvider.AppleMusic;
  }

  /**
   * Adapt a raw Apple Music playlist response to UnifiedPlaylist
   *
   * Apple Music API Response Structure:
   * {
   *   data: [{
   *     id: string,
   *     type: "playlists",
   *     attributes: {
   *       name: string,
   *       description: { standard: string },
   *       artwork: { url: string, width, height },
   *       isPublic: boolean
   *     },
   *     relationships: {
   *       tracks: {
   *         data: [{ id, type, attributes }]
   *       }
   *     }
   *   }]
   * }
   */
  adapt(rawResponse: any): UnifiedPlaylist {
    // Apple Music wraps response in data array
    const playlistData = rawResponse.data?.[0] || rawResponse;
    const attributes = playlistData.attributes || {};

    // Tracks are in relationships.tracks.data
    const rawTracks = playlistData.relationships?.tracks?.data || [];
    const tracks: UnifiedTrack[] = rawTracks.map((t: any) => this.adaptTrack(t));

    return {
      id: `unified-apple-${playlistData.id}`,
      name: attributes.name || 'Unknown Playlist',
      description: attributes.description?.standard || '',
      tracks,
      imageUrl: this.extractArtworkUrl(attributes.artwork),
      isPublic: attributes.isPublic ?? true,
      sourceProvider: MusicProvider.AppleMusic,
      originalId: playlistData.id,
      totalTracks: tracks.length
    };
  }

  /**
   * Adapt a raw Apple Music track to UnifiedTrack
   *
   * Apple Music Track Structure:
   * {
   *   id: string,
   *   type: "songs",
   *   attributes: {
   *     name: string,
   *     artistName: string,
   *     albumName: string,
   *     durationInMillis: number,
   *     isrc: string,
   *     artwork: { url, width, height },
   *     previews: [{ url: string }],
   *     releaseDate: string
   *   }
   * }
   */
  adaptTrack(rawTrack: any): UnifiedTrack {
    const attributes = rawTrack.attributes || {};

    return {
      id: `unified-apple-track-${rawTrack.id}`,
      name: attributes.name || 'Unknown Track',
      artists: this.extractArtists(attributes),
      album: this.extractAlbum(attributes),
      durationMs: attributes.durationInMillis || 0,
      isrc: attributes.isrc,
      sourceProvider: MusicProvider.AppleMusic,
      originalId: rawTrack.id,
      previewUrl: attributes.previews?.[0]?.url
    };
  }

  /**
   * Apple Music provides artistName as a string, not an array.
   * We create a single artist entry from it.
   */
  private extractArtists(attributes: any): UnifiedArtist[] {
    if (!attributes.artistName) return [];

    // Apple Music doesn't always provide artist ID inline
    // We use a hash of the name as a pseudo-ID
    const artistId = this.generatePseudoId(attributes.artistName);

    return [{
      id: `unified-apple-artist-${artistId}`,
      name: attributes.artistName,
      sourceProvider: MusicProvider.AppleMusic,
      originalId: artistId
    }];
  }

  private extractAlbum(attributes: any): UnifiedAlbum {
    if (!attributes.albumName) {
      return {
        id: 'unknown',
        name: 'Unknown Album',
        artists: [],
        sourceProvider: MusicProvider.AppleMusic,
        originalId: 'unknown'
      };
    }

    const albumId = this.generatePseudoId(attributes.albumName);

    return {
      id: `unified-apple-album-${albumId}`,
      name: attributes.albumName,
      artists: this.extractArtists(attributes),
      releaseDate: attributes.releaseDate,
      imageUrl: this.extractArtworkUrl(attributes.artwork),
      sourceProvider: MusicProvider.AppleMusic,
      originalId: albumId
    };
  }

  /**
   * Apple provides artwork URL with {w} and {h} placeholders
   * that need to be replaced with actual dimensions
   */
  private extractArtworkUrl(artwork: any): string | undefined {
    if (!artwork?.url) return undefined;

    return artwork.url
      .replace('{w}', '300')
      .replace('{h}', '300');
  }

  /**
   * Generate a pseudo-ID from a string (for cases where Apple doesn't provide ID)
   */
  private generatePseudoId(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}
