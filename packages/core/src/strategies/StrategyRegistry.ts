/**
 * StrategyRegistry
 *
 * STRATEGY PATTERN - Registry/Lookup
 *
 * Central registry for all conversion strategies.
 * Allows lookup by source/target provider pair.
 */

import { ConversionStrategy } from '@iuly/iuly-interfaces';
import { MusicProvider } from '@iuly/iuly-models';
import { SpotifyToAppleStrategy } from './SpotifyToAppleStrategy';
import { AppleToSpotifyStrategy } from './AppleToSpotifyStrategy';

export class StrategyRegistry {
  private static strategies: Map<string, ConversionStrategy> = new Map();
  private static initialized = false;

  /**
   * Initialize the registry with all available strategies.
   * Called automatically on first use.
   */
  private static initialize(): void {
    if (this.initialized) return;

    this.register(new SpotifyToAppleStrategy());
    this.register(new AppleToSpotifyStrategy());

    this.initialized = true;
  }

  /**
   * Register a conversion strategy.
   * Can be used to add new strategies at runtime.
   */
  static register(strategy: ConversionStrategy): void {
    const key = strategy.getKey();
    this.strategies.set(key, strategy);
  }

  /**
   * Get the strategy for a specific source/target pair.
   * @returns Strategy or null if not found
   */
  static getStrategy(
    source: MusicProvider,
    target: MusicProvider
  ): ConversionStrategy | null {
    this.initialize();

    const key = this.buildKey(source, target);
    return this.strategies.get(key) || null;
  }

  /**
   * Check if a strategy exists for a source/target pair.
   */
  static hasStrategy(source: MusicProvider, target: MusicProvider): boolean {
    this.initialize();
    const key = this.buildKey(source, target);
    return this.strategies.has(key);
  }

  /**
   * Get all available conversion paths.
   */
  static getAvailableConversions(): Array<{ source: MusicProvider; target: MusicProvider }> {
    this.initialize();

    return Array.from(this.strategies.values()).map(strategy => ({
      source: strategy.getSourceProvider(),
      target: strategy.getTargetProvider()
    }));
  }

  /**
   * Get all registered strategies.
   */
  static getAllStrategies(): ConversionStrategy[] {
    this.initialize();
    return Array.from(this.strategies.values());
  }

  /**
   * Build a lookup key from source and target providers.
   */
  private static buildKey(source: MusicProvider, target: MusicProvider): string {
    return `${source}->${target}`;
  }
}
