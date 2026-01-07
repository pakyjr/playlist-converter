/**
 * SpotifyFactory
 *
 * ABSTRACT FACTORY PATTERN - Concrete Factory
 *
 * Creates a family of Spotify-specific components:
 * - SpotifyDAL (Data Access Layer)
 * - SpotifyAuthHandler (OAuth 2.0)
 * - SpotifyPlaylistAdapter
 *
 * All components are guaranteed to work together.
 */

import {
  MusicProviderFactory,
  ProviderDAL,
  AuthHandler,
  PlaylistAdapter
} from '@iuly/iuly-interfaces';
import { MusicProvider } from '@iuly/iuly-models';
import { SpotifyDAL } from '@iuly/iuly-dal';
import { SpotifyAuthHandler } from '../auth/SpotifyAuthHandler';
import { SpotifyPlaylistAdapter } from '../adapters/SpotifyPlaylistAdapter';

export class SpotifyFactory implements MusicProviderFactory {

  createDAL(): ProviderDAL {
    return new SpotifyDAL();
  }

  createAuthHandler(): AuthHandler {
    return new SpotifyAuthHandler();
  }

  createPlaylistAdapter(): PlaylistAdapter {
    return new SpotifyPlaylistAdapter();
  }

  getProviderType(): MusicProvider {
    return MusicProvider.Spotify;
  }
}
