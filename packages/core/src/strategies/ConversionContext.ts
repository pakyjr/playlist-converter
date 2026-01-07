/**
 * ConversionContext
 *
 * STRATEGY PATTERN - Context
 *
 * Maintains a reference to a ConversionStrategy and delegates
 * the conversion work to it. Allows changing the strategy at runtime.
 */

import { ConversionStrategy, ProviderDAL } from '@iuly/iuly-interfaces';
import { UnifiedPlaylist, ConversionResult, MusicProvider } from '@iuly/iuly-models';

export class ConversionContext {
  private strategy: ConversionStrategy | null = null;

  constructor(strategy?: ConversionStrategy) {
    if (strategy) {
      this.strategy = strategy;
    }
  }

  /**
   * Set or change the conversion strategy
   */
  setStrategy(strategy: ConversionStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Get the current strategy
   */
  getStrategy(): ConversionStrategy | null {
    return this.strategy;
  }

  /**
   * Execute conversion using the current strategy
   * @throws Error if no strategy is set
   */
  async executeConversion(
    playlist: UnifiedPlaylist,
    targetDAL: ProviderDAL,
    targetToken: string
  ): Promise<ConversionResult> {
    if (!this.strategy) {
      throw new Error('No conversion strategy set. Use setStrategy() first.');
    }

    return this.strategy.convert(playlist, targetDAL, targetToken);
  }

  /**
   * Get information about the current strategy
   */
  getStrategyInfo(): { source: MusicProvider; target: MusicProvider; key: string } | null {
    if (!this.strategy) return null;

    return {
      source: this.strategy.getSourceProvider(),
      target: this.strategy.getTargetProvider(),
      key: this.strategy.getKey()
    };
  }

  /**
   * Check if a strategy is set
   */
  hasStrategy(): boolean {
    return this.strategy !== null;
  }
}
