/**
 * ProviderFactoryRegistry
 *
 * ABSTRACT FACTORY PATTERN - Registry/Lookup
 *
 * Central registry for all music provider factories.
 * Clients use this to get the appropriate factory for a provider
 * without knowing the concrete factory classes.
 */

import { MusicProviderFactory } from '@iuly/iuly-interfaces';
import { MusicProvider } from '@iuly/iuly-models';
import { SpotifyFactory } from './SpotifyFactory';
import { AppleMusicFactory } from './AppleMusicFactory';

export class ProviderFactoryRegistry {
  private static factories: Map<MusicProvider, MusicProviderFactory> = new Map();
  private static initialized = false;

  /**
   * Initialize the registry with all available factories.
   * Called automatically on first use.
   */
  private static initialize(): void {
    if (this.initialized) return;

    this.registerFactory(new SpotifyFactory());
    this.registerFactory(new AppleMusicFactory());

    this.initialized = true;
  }

  /**
   * Register a factory for a provider.
   * Can be used to add new providers at runtime.
   */
  static registerFactory(factory: MusicProviderFactory): void {
    this.factories.set(factory.getProviderType(), factory);
  }

  /**
   * Get the factory for a specific provider.
   * @throws Error if provider is not registered
   */
  static getFactory(provider: MusicProvider): MusicProviderFactory {
    this.initialize();

    const factory = this.factories.get(provider);
    if (!factory) {
      throw new Error(`No factory registered for provider: ${provider}`);
    }
    return factory;
  }

  /**
   * Check if a provider has a registered factory.
   */
  static hasFactory(provider: MusicProvider): boolean {
    this.initialize();
    return this.factories.has(provider);
  }

  /**
   * Get list of all available providers.
   */
  static getAvailableProviders(): MusicProvider[] {
    this.initialize();
    return Array.from(this.factories.keys());
  }

  /**
   * Get all registered factories.
   */
  static getAllFactories(): MusicProviderFactory[] {
    this.initialize();
    return Array.from(this.factories.values());
  }
}
