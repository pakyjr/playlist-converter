/**
 * MusicProviderFactory Interface
 *
 * Part of the ABSTRACT FACTORY PATTERN implementation.
 *
 * Abstract Factory that creates families of related objects
 * for each music provider. Ensures that all components
 * (DAL, AuthHandler, Adapter) are compatible with each other.
 */

import { MusicProvider } from '@iuly/iuly-models';
import { ProviderDAL } from './ProviderDAL';
import { AuthHandler } from './AuthHandler';
import { PlaylistAdapter } from './PlaylistAdapter';

export interface MusicProviderFactory {
  /**
   * Create the Data Access Layer for this provider
   * @returns Provider-specific DAL implementation
   */
  createDAL(): ProviderDAL;

  /**
   * Create the authentication handler for this provider
   * @returns Provider-specific AuthHandler implementation
   */
  createAuthHandler(): AuthHandler;

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
