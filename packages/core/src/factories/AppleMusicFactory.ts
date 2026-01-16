/**
 * AppleMusicFactory
 *
 * ABSTRACT FACTORY PATTERN - Concrete Factory
 *
 * Creates a family of Apple Music-specific components:
 * - AppleMusicDAL (Data Access Layer)
 * - AppleMusicPlaylistAdapter
 *
 * All components are guaranteed to work together.
 */

import {
  MusicProviderFactory,
  ProviderDAL,
  PlaylistAdapter
} from '@iuly/iuly-interfaces';
import { MusicProvider } from '@iuly/iuly-models';
import { AppleMusicDAL } from '@iuly/iuly-dal';
import { AppleMusicPlaylistAdapter } from '../adapters/AppleMusicPlaylistAdapter';

export class AppleMusicFactory implements MusicProviderFactory {

  createDAL(): ProviderDAL {
    return new AppleMusicDAL();
  }

  createPlaylistAdapter(): PlaylistAdapter {
    return new AppleMusicPlaylistAdapter();
  }

  getProviderType(): MusicProvider {
    return MusicProvider.AppleMusic;
  }
}
