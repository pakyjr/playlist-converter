/**
 * SpotifyFactory
 *
 * ABSTRACT FACTORY PATTERN - Concrete Factory
 *
 * Creates a family of Spotify-specific components:
 * - SpotifyDAL (Data Access Layer)
 * - SpotifyPlaylistAdapter
 *
 * All components are guaranteed to work together.
 */

import {
  MusicProviderFactory,
  ProviderDAL,
  PlaylistAdapter
} from '@iuly/iuly-interfaces';
import { MusicProvider } from '@iuly/iuly-models';
import { SpotifyDAL } from '@iuly/iuly-dal';
import { SpotifyPlaylistAdapter } from '../adapters/SpotifyPlaylistAdapter';

export class SpotifyFactory implements MusicProviderFactory {

  createDAL(): ProviderDAL {
    return new SpotifyDAL();
  }

  createPlaylistAdapter(): PlaylistAdapter {
    return new SpotifyPlaylistAdapter();
  }

  getProviderType(): MusicProvider {
    return MusicProvider.Spotify;
  }
}
