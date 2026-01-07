/**
 * Core Module - Main Entry Point
 *
 * This module orchestrates the design patterns:
 * - ABSTRACT FACTORY: ProviderFactoryRegistry creates provider components
 * - ADAPTER: PlaylistAdapters normalize API responses
 * - STRATEGY: ConversionStrategies handle playlist conversion
 */

import {
  AllDal,
  ProviderDAL,
  AuthHandler,
  PlaylistAdapter,
  MusicProviderFactory,
  ConversionStrategy
} from '@iuly/iuly-interfaces';
import { MusicProvider, UnifiedPlaylist, ConversionResult } from '@iuly/iuly-models';
import { SpotifyCore } from './spotify/core';
import { ProviderFactoryRegistry } from './factories/ProviderFactoryRegistry';
import { StrategyRegistry } from './strategies/StrategyRegistry';
import { ConversionContext } from './strategies/ConversionContext';

// Export legacy singleton
export * from './coreSingleton';

// Export new pattern implementations
export * from './adapters';
export * from './factories';
export * from './strategies';
export * from './auth';

/**
 * ProviderCore - Generic core for any music provider
 *
 * Uses components created by the factory to perform operations.
 */
export class ProviderCore {
  constructor(
    private dal: ProviderDAL,
    private authHandler: AuthHandler,
    private adapter: PlaylistAdapter,
    private provider: MusicProvider
  ) {}

  async getPlaylist(sessionId: string, playlistUrl: string): Promise<UnifiedPlaylist | null> {
    const token = await this.dal.getToken(sessionId);
    if (!token) return null;

    const playlistId = this.extractPlaylistId(playlistUrl);
    const rawPlaylist = await this.dal.getPlaylist(token, playlistId);

    if (!rawPlaylist) return null;

    return this.adapter.adapt(rawPlaylist);
  }

  generateAuthUrl(sessionId: string): string {
    return this.authHandler.generateAuthUrl(sessionId);
  }

  async handleAuthCallback(code: string, sessionId: string): Promise<void> {
    const authToken = await this.authHandler.handleCallback(code, sessionId);
    await this.dal.addSessionToken(authToken, sessionId);
  }

  async isAuthenticated(sessionId: string): Promise<boolean> {
    const token = await this.dal.getToken(sessionId);
    return token !== null;
  }

  getProvider(): MusicProvider {
    return this.provider;
  }

  getDAL(): ProviderDAL {
    return this.dal;
  }

  private extractPlaylistId(url: string): string {
    // Handle both URL formats and direct IDs
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    // Remove query parameters if present
    return lastPart.split('?')[0];
  }
}

/**
 * CoreIndex - Main orchestrator (refactored to use patterns)
 *
 * Maintains backwards compatibility with existing SpotifyCore
 * while adding support for multiple providers via factories.
 */
export class CoreIndex {
  // Legacy: Keep SpotifyCore for backwards compatibility
  spotifyCore: SpotifyCore;

  // New: Provider cores created via factories
  private providerCores: Map<MusicProvider, ProviderCore> = new Map();

  // Conversion context for strategy pattern
  private conversionContext: ConversionContext;

  constructor(allDal: AllDal) {
    // Legacy initialization
    this.spotifyCore = new SpotifyCore(allDal.spotify);

    // New: Initialize provider cores using factories
    this.initializeProviderCores();

    // Initialize conversion context
    this.conversionContext = new ConversionContext();
  }

  private initializeProviderCores(): void {
    for (const provider of ProviderFactoryRegistry.getAvailableProviders()) {
      const factory = ProviderFactoryRegistry.getFactory(provider);
      const core = new ProviderCore(
        factory.createDAL(),
        factory.createAuthHandler(),
        factory.createPlaylistAdapter(),
        provider
      );
      this.providerCores.set(provider, core);
    }
  }

  /**
   * Get the core for a specific provider
   */
  getProviderCore(provider: MusicProvider): ProviderCore {
    const core = this.providerCores.get(provider);
    if (!core) {
      throw new Error(`No core available for provider: ${provider}`);
    }
    return core;
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders(): MusicProvider[] {
    return ProviderFactoryRegistry.getAvailableProviders();
  }

  /**
   * Convert a playlist from one provider to another
   *
   * Uses STRATEGY PATTERN to select the appropriate conversion algorithm.
   */
  async convertPlaylist(
    sourceProvider: MusicProvider,
    targetProvider: MusicProvider,
    sessionId: string,
    playlistUrl: string
  ): Promise<ConversionResult> {
    // Get appropriate strategy
    const strategy = StrategyRegistry.getStrategy(sourceProvider, targetProvider);
    if (!strategy) {
      throw new Error(`No conversion strategy for ${sourceProvider} -> ${targetProvider}`);
    }

    // Get source playlist (unified via adapter)
    const sourceCore = this.getProviderCore(sourceProvider);
    const playlist = await sourceCore.getPlaylist(sessionId, playlistUrl);
    if (!playlist) {
      throw new Error('Failed to fetch source playlist');
    }

    // Get target DAL and token
    const targetCore = this.getProviderCore(targetProvider);
    const targetToken = await targetCore.getDAL().getToken(sessionId);
    if (!targetToken) {
      throw new Error(`Not authenticated with ${targetProvider}`);
    }

    // Execute conversion using strategy
    this.conversionContext.setStrategy(strategy);
    return this.conversionContext.executeConversion(
      playlist,
      targetCore.getDAL(),
      targetToken
    );
  }

  /**
   * Get available conversion paths
   */
  getAvailableConversions(): Array<{ source: MusicProvider; target: MusicProvider }> {
    return StrategyRegistry.getAvailableConversions();
  }
}