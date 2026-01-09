/**
 * DemoController
 *
 * Test endpoints for demonstrating the design patterns
 * WITHOUT requiring real authentication.
 *
 * These endpoints use mock data to show the patterns working.
 */

import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../../../responseHandler';
import { CoreIndex, ProviderFactoryRegistry, StrategyRegistry } from '@iuly/iuly-core';
import { MusicProvider } from '@iuly/iuly-models';

export class DemoController {

  constructor(private core: CoreIndex) {}

  /**
   * GET /v1/demo/test
   *
   * Simple test endpoint to verify the server is running.
   */
  async test(req: Request, res: Response, next: NextFunction) {
    ResponseHandler.ok(res, {
      message: 'Design Patterns Demo API is running!',
      patterns: ['Strategy', 'Adapter', 'Abstract Factory'],
      endpoints: {
        test: 'GET /v1/demo/test',
        providers: 'GET /v1/demo/providers',
        mockPlaylist: 'GET /v1/demo/mock-playlist/:provider',
        convert: 'POST /v1/demo/convert'
      }
    });
    return next();
  }

  /**
   * GET /v1/demo/providers
   *
   * Show available providers and conversion paths.
   * Demonstrates ABSTRACT FACTORY pattern (registry).
   */
  async providers(req: Request, res: Response, next: NextFunction) {
    try {
      const providers = ProviderFactoryRegistry.getAvailableProviders();
      const conversions = StrategyRegistry.getAvailableConversions();
      const factories = ProviderFactoryRegistry.getAllFactories();

      ResponseHandler.ok(res, {
        pattern: 'ABSTRACT FACTORY',
        description: 'ProviderFactoryRegistry manages factories for each provider',
        availableProviders: providers,
        registeredFactories: factories.map(f => ({
          provider: f.getProviderType(),
          creates: ['DAL', 'AuthHandler', 'PlaylistAdapter']
        })),
        conversionPaths: conversions.map(c => `${c.source} -> ${c.target}`)
      });
    } catch (err: any) {
      ResponseHandler.badRequest(res, err.message);
    }
    return next();
  }

  /**
   * GET /v1/demo/mock-playlist/:provider
   *
   * Get a mock playlist from a provider.
   * Demonstrates ADAPTER pattern (raw -> unified format).
   */
  async mockPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const providerParam = req.params.provider?.toLowerCase();

      let provider: MusicProvider;
      if (providerParam === 'spotify') {
        provider = MusicProvider.Spotify;
      } else if (providerParam === 'apple' || providerParam === 'applemusic') {
        provider = MusicProvider.AppleMusic;
      } else {
        ResponseHandler.badRequest(res, 'Invalid provider. Use: spotify or apple');
        return next();
      }

      // Get factory and create components
      const factory = ProviderFactoryRegistry.getFactory(provider);
      const dal = factory.createDAL();
      const adapter = factory.createPlaylistAdapter();

      // Get raw playlist (mock data for Apple, would need auth for Spotify)
      const rawPlaylist = await dal.getPlaylist('mock-token', 'demo-playlist-123');

      if (!rawPlaylist) {
        ResponseHandler.badRequest(res, 'Could not fetch playlist');
        return next();
      }

      // Adapt to unified format
      const unifiedPlaylist = adapter.adapt(rawPlaylist);

      ResponseHandler.ok(res, {
        pattern: 'ADAPTER',
        description: `${provider}PlaylistAdapter converts raw API response to UnifiedPlaylist`,
        provider,
        rawFormat: 'Provider-specific JSON structure',
        unifiedPlaylist: {
          id: unifiedPlaylist.id,
          name: unifiedPlaylist.name,
          description: unifiedPlaylist.description,
          sourceProvider: unifiedPlaylist.sourceProvider,
          totalTracks: unifiedPlaylist.totalTracks,
          tracks: unifiedPlaylist.tracks.map(t => ({
            name: t.name,
            artist: t.artists[0]?.name,
            album: t.album.name,
            isrc: t.isrc
          }))
        }
      });
    } catch (err: any) {
      ResponseHandler.badRequest(res, err.message);
    }
    return next();
  }

  /**
   * POST /v1/demo/convert
   *
   * Demo conversion WITHOUT authentication.
   * Uses mock data to demonstrate STRATEGY pattern.
   *
   * Body: { sourceProvider: "Apple Music", targetProvider: "Spotify" }
   */
  async convert(req: Request, res: Response, next: NextFunction) {
    try {
      const { sourceProvider, targetProvider } = req.body;

      // Default to Apple -> Spotify if not specified (uses all mock data)
      const source = sourceProvider || MusicProvider.AppleMusic;
      const target = targetProvider || MusicProvider.Spotify;

      if (source === target) {
        ResponseHandler.badRequest(res, 'Source and target must be different');
        return next();
      }

      // Get strategy
      const strategy = StrategyRegistry.getStrategy(source, target);
      if (!strategy) {
        ResponseHandler.badRequest(res, `No strategy for ${source} -> ${target}`);
        return next();
      }

      // Get source playlist using factory + adapter
      const sourceFactory = ProviderFactoryRegistry.getFactory(source);
      const sourceDAL = sourceFactory.createDAL();
      const sourceAdapter = sourceFactory.createPlaylistAdapter();

      const rawSourcePlaylist = await sourceDAL.getPlaylist('mock-token', 'demo-playlist');
      if (!rawSourcePlaylist) {
        ResponseHandler.badRequest(res, 'Could not fetch source playlist');
        return next();
      }
      const sourcePlaylist = sourceAdapter.adapt(rawSourcePlaylist);

      // Get target DAL for conversion
      const targetFactory = ProviderFactoryRegistry.getFactory(target);
      const targetDAL = targetFactory.createDAL();

      // Execute conversion using strategy
      console.log(`\n========== DEMO CONVERSION ==========`);
      console.log(`Strategy: ${strategy.getKey()}`);
      console.log(`Source: ${sourcePlaylist.name} (${sourcePlaylist.totalTracks} tracks)`);
      console.log(`======================================\n`);

      const result = await strategy.convert(sourcePlaylist, targetDAL, 'mock-token');

      ResponseHandler.ok(res, {
        pattern: 'STRATEGY',
        description: `${strategy.getKey()} strategy handles the conversion algorithm`,
        strategyUsed: strategy.getKey(),
        conversion: {
          sourceProvider: source,
          targetProvider: target,
          originalPlaylist: {
            name: result.originalPlaylist.name,
            totalTracks: result.originalPlaylist.totalTracks
          },
          results: {
            matchedTracks: result.matchedTracks.length,
            unmatchedTracks: result.unmatchedTracks.length,
            matchRate: `${Math.round(result.matchRate * 100)}%`
          },
          matchedTracksList: result.matchedTracks.map(t => ({
            name: t.name,
            artist: t.artists[0]?.name || 'Unknown',
            targetId: t.originalId
          })),
          unmatchedTracksList: result.unmatchedTracks.map(t => ({
            name: t.name,
            artist: t.artists[0]?.name || 'Unknown',
            reason: 'No match found in target catalog'
          }))
        }
      });

    } catch (err: any) {
      console.error('[Demo Convert] Error:', err);
      ResponseHandler.badRequest(res, err.message);
    }
    return next();
  }
}
