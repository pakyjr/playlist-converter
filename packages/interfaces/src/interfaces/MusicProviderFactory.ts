/**
 * MusicProviderFactory Interface
 *
 * Part of the ABSTRACT FACTORY PATTERN implementation.
 *
 * Abstract Factory that creates families of related objects
 * for each music provider. Ensures that DAL and Adapter
 * are compatible with each other.
 *
 * Note: Auth handlers are in the API layer (not created by factory)
 * since they handle HTTP/network responses.
 */

import { MusicProvider } from '@iuly/iuly-models';
import { ProviderDAL } from './ProviderDAL';
import { PlaylistAdapter } from './PlaylistAdapter';

export interface MusicProviderFactory {
  /**
   * Create the Data Access Layer for this provider
   * @returns Provider-specific DAL implementation
   */
  createDAL(): ProviderDAL;

  /**
   * Create the playlist adapter for this provider
   * @returns Provider-specific PlaylistAdapter implementation
   */
  createPlaylistAdapter(): PlaylistAdapter;

  /**
   * Get the provider type this factory creates components for
   * @returns The music provider enum value
   */
  getProviderType(): MusicProvider;
}
