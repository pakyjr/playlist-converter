/**
 * Strategies Module
 *
 * STRATEGY PATTERN exports
 *
 * Strategies define different algorithms for converting playlists
 * between music providers. Each strategy encapsulates the specific
 * logic for a source/target pair.
 */

export { BaseConversionStrategy } from './BaseConversionStrategy';
export { SpotifyToAppleStrategy } from './SpotifyToAppleStrategy';
export { AppleToSpotifyStrategy } from './AppleToSpotifyStrategy';
export { ConversionContext } from './ConversionContext';
export { StrategyRegistry } from './StrategyRegistry';
