/**
 * AppleMusicFactory
 *
 * ABSTRACT FACTORY PATTERN - Concrete Factory
 *
 * Creates a family of Apple Music-specific components:
 * - AppleMusicDAL (Data Access Layer with mock data)
 * - AppleMusicAuthHandler (JWT authentication)
 * - AppleMusicPlaylistAdapter
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
import { AppleMusicDAL } from '@iuly/iuly-dal';
import { AppleMusicAuthHandler } from '../auth/AppleMusicAuthHandler';
import { AppleMusicPlaylistAdapter } from '../adapters/AppleMusicPlaylistAdapter';

export class AppleMusicFactory implements MusicProviderFactory {

  createDAL(): ProviderDAL {
    return new AppleMusicDAL();
  }

  createAuthHandler(): AuthHandler {
    return new AppleMusicAuthHandler();
  }

  createPlaylistAdapter(): PlaylistAdapter {
    return new AppleMusicPlaylistAdapter();
  }

  getProviderType(): MusicProvider {
    return MusicProvider.AppleMusic;
  }
}
