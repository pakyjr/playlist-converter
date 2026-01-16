/**
 * Core Module - Main Entry Point
 *
 * This module orchestrates the design patterns:
 * - ABSTRACT FACTORY: ProviderFactoryRegistry creates provider components (DAL + Adapter)
 * - ADAPTER: PlaylistAdapters normalize API responses
 * - STRATEGY: ConversionStrategies handle playlist conversion
 *
 * Note: Auth handlers are in the API layer since they handle HTTP/network responses.
 */

import {
  ProviderDAL,
  PlaylistAdapter
} from '@iuly/iuly-interfaces';
import { MusicProvider, UnifiedPlaylist, ConversionResult } from '@iuly/iuly-models';
import {
  isPlaylistSizeAllowed,
  getDelayForPlaylistSize,
  getEstimatedTime,
  PLAYLIST_TIERS
} from '@iuly/iuly-utils';
import { ProviderFactoryRegistry } from './factories/ProviderFactoryRegistry';
import { StrategyRegistry } from './strategies/StrategyRegistry';
import { ConversionContext } from './strategies/ConversionContext';

// Export pattern implementations
export * from './adapters';
export * from './factories';
export * from './strategies';

/**
 * ProviderCore - Generic core for any music provider
 *
 * Uses DAL and Adapter created by the factory.
 * Auth is handled at the API layer (not core's responsibility).
 */
export class ProviderCore {
  constructor(
    private dal: ProviderDAL,
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
 * CoreIndex - Main orchestrator
 *
 * Uses the design patterns to handle playlist conversion:
 * - Factory creates provider-specific DAL and Adapter
 * - Strategy handles the conversion algorithm
 */
export class CoreIndex {
  private providerCores: Map<MusicProvider, ProviderCore> = new Map();
  private conversionContext: ConversionContext;

  constructor() {
    this.initializeProviderCores();
    this.conversionContext = new ConversionContext();
  }

  private initializeProviderCores(): void {
    for (const provider of ProviderFactoryRegistry.getAvailableProviders()) {
      const factory = ProviderFactoryRegistry.getFactory(provider);
      const core = new ProviderCore(
        factory.createDAL(),
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
    playlistUrl: string,
    onProgress?: (current: number, total: number) => void
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

    // Check playlist size limits
    const trackCount = playlist.tracks.length;
    if (!isPlaylistSizeAllowed(trackCount)) {
      throw new Error(
        `Playlist too large (${trackCount} tracks). ` +
        `Maximum allowed is ${PLAYLIST_TIERS.MAX.maxTracks} tracks. ` +
        `Please use a smaller playlist.`
      );
    }

    // Determine delay based on playlist size
    const delayMs = getDelayForPlaylistSize(trackCount);
    console.log(`[CoreIndex] Playlist has ${trackCount} tracks, using ${delayMs}ms delay between requests`);

    // Get target DAL and token
    const targetCore = this.getProviderCore(targetProvider);
    const targetDAL = targetCore.getDAL();
    const targetToken = await targetDAL.getToken(sessionId);
    if (!targetToken) {
      throw new Error(`Not authenticated with ${targetProvider}`);
    }

    // Get music user token if available (needed for Apple Music playlist creation)
    const musicUserToken = targetDAL.getMusicUserToken
      ? await targetDAL.getMusicUserToken(sessionId)
      : null;

    // Execute conversion using strategy
    this.conversionContext.setStrategy(strategy);
    return this.conversionContext.executeConversion(
      playlist,
      targetDAL,
      targetToken,
      musicUserToken ?? undefined,
      delayMs,
      onProgress
    );
  }

  /**
   * Get playlist limits info for frontend
   */
  getPlaylistLimits() {
    return {
      small: { maxTracks: PLAYLIST_TIERS.SMALL.maxTracks, estimatedTimePerTrack: PLAYLIST_TIERS.SMALL.delayMs },
      medium: { maxTracks: PLAYLIST_TIERS.MEDIUM.maxTracks, estimatedTimePerTrack: PLAYLIST_TIERS.MEDIUM.delayMs },
      max: PLAYLIST_TIERS.MAX.maxTracks
    };
  }

  /**
   * Get available conversion paths
   */
  getAvailableConversions(): Array<{ source: MusicProvider; target: MusicProvider }> {
    return StrategyRegistry.getAvailableConversions();
  }
}