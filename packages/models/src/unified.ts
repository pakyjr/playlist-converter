/**
 * Unified Models for Playlist Converter
 *
 * These models provide a common interface for playlist data
 * regardless of the source provider (Spotify, Apple Music, etc.)
 *
 * Part of the ADAPTER PATTERN implementation.
 */

import { MusicProvider } from './common';

/**
 * Unified representation of a music artist
 */
export interface UnifiedArtist {
  id: string;
  name: string;
  sourceProvider: MusicProvider;
  originalId: string;
}

/**
 * Unified representation of a music album
 */
export interface UnifiedAlbum {
  id: string;
  name: string;
  artists: UnifiedArtist[];
  releaseDate?: string;
  imageUrl?: string;
  sourceProvider: MusicProvider;
  originalId: string;
}

/**
 * Unified representation of a music track
 */
export interface UnifiedTrack {
  id: string;
  name: string;
  artists: UnifiedArtist[];
  album: UnifiedAlbum;
  durationMs: number;
  isrc?: string;  // International Standard Recording Code - used for matching
  sourceProvider: MusicProvider;
  originalId: string;
  previewUrl?: string;
}

/**
 * Unified representation of a playlist
 */
export interface UnifiedPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: UnifiedTrack[];
  imageUrl?: string;
  isPublic: boolean;
  sourceProvider: MusicProvider;
  originalId: string;
  totalTracks: number;
}

/**
 * Result of a playlist conversion operation
 * Used by STRATEGY PATTERN implementations
 */
export interface ConversionResult {
  originalPlaylist: UnifiedPlaylist;
  matchedTracks: UnifiedTrack[];
  unmatchedTracks: UnifiedTrack[];
  matchRate: number;  // 0.0 to 1.0
  targetProvider: MusicProvider;
}

/**
 * Authentication token representation
 */
export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;  // seconds
  tokenType: string;
  scope?: string;
}
