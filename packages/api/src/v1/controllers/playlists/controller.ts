import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../../../responseHandler';
import { CoreIndex } from '@iuly/iuly-core'
import { MusicProvider, ConversionResult } from '@iuly/iuly-models'

export class PlaylistController {

  constructor(private core: CoreIndex) {}

  /**
   * POST /v1/playlist/convert
   *
   * Convert a playlist from one provider to another.
   * Uses STRATEGY PATTERN to select appropriate conversion algorithm.
   * Validation handled by validateConversionRequest middleware.
   */
  async convertPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionID: string = req.sessionID;
      const { sourceProvider, targetProvider, playlistUrl } = req.body;

      console.log(`[Convert] ${sourceProvider} -> ${targetProvider}: ${playlistUrl}`);

      // Execute conversion using the design patterns
      const result: ConversionResult = await this.core.convertPlaylist(
        sourceProvider as MusicProvider,
        targetProvider as MusicProvider,
        sessionID,
        playlistUrl
      );

      // Return conversion result
      ResponseHandler.ok(res, {
        success: true,
        conversion: {
          sourceProvider,
          targetProvider,
          originalPlaylist: {
            name: result.originalPlaylist.name,
            totalTracks: result.originalPlaylist.totalTracks
          },
          matchedTracks: result.matchedTracks.length,
          unmatchedTracks: result.unmatchedTracks.length,
          matchRate: Math.round(result.matchRate * 100) + '%',
          matchedTracksList: result.matchedTracks.map(t => ({
            name: t.name,
            artist: t.artists[0]?.name || 'Unknown',
            originalId: t.originalId
          })),
          unmatchedTracksList: result.unmatchedTracks.map(t => ({
            name: t.name,
            artist: t.artists[0]?.name || 'Unknown'
          })),
          createdPlaylist: result.createdPlaylist
        }
      });

    } catch (err: any) {
      console.error('[Convert] Error:', err);
      ResponseHandler.badRequest(res, err.message || 'Conversion failed');
    }
    return next();
  }

  /**
   * POST /v1/playlist/convert/stream
   *
   * Convert a playlist with Server-Sent Events for progress updates.
   * Returns progress updates as SSE events, then final result.
   * Validation handled by validateConversionRequest middleware.
   */
  async convertPlaylistWithProgress(req: Request, res: Response) {
    const sessionID: string = req.sessionID;
    const { sourceProvider, targetProvider, playlistUrl } = req.body;

    // Set up SSE headers with CORS
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5173');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.flushHeaders();

    console.log(`[Convert/Stream] ${sourceProvider} -> ${targetProvider}: ${playlistUrl}`);

    try {
      // Progress callback for SSE updates
      const onProgress = (current: number, total: number) => {
        const progressData = JSON.stringify({ type: 'progress', current, total });
        res.write(`data: ${progressData}\n\n`);
      };

      // Execute conversion with progress tracking
      const result: ConversionResult = await this.core.convertPlaylist(
        sourceProvider as MusicProvider,
        targetProvider as MusicProvider,
        sessionID,
        playlistUrl,
        onProgress
      );

      // Send final result
      const resultData = JSON.stringify({
        type: 'complete',
        success: true,
        conversion: {
          sourceProvider,
          targetProvider,
          originalPlaylist: {
            name: result.originalPlaylist.name,
            totalTracks: result.originalPlaylist.totalTracks
          },
          matchedTracks: result.matchedTracks.length,
          unmatchedTracks: result.unmatchedTracks.length,
          matchRate: Math.round(result.matchRate * 100) + '%',
          matchedTracksList: result.matchedTracks.map(t => ({
            name: t.name,
            artist: t.artists[0]?.name || 'Unknown',
            originalId: t.originalId
          })),
          unmatchedTracksList: result.unmatchedTracks.map(t => ({
            name: t.name,
            artist: t.artists[0]?.name || 'Unknown'
          })),
          createdPlaylist: result.createdPlaylist
        }
      });
      res.write(`data: ${resultData}\n\n`);

    } catch (err: any) {
      console.error('[Convert/Stream] Error:', err);
      const errorData = JSON.stringify({ type: 'error', error: err.message || 'Conversion failed' });
      res.write(`data: ${errorData}\n\n`);
    }

    res.end();
  }

  /**
   * GET /v1/playlist/limits
   *
   * Get playlist size limits and rate limiting info.
   */
  async getLimits(req: Request, res: Response, next: NextFunction) {
    try {
      const limits = this.core.getPlaylistLimits();
      ResponseHandler.ok(res, limits);
    } catch (err: any) {
      console.error('[Limits] Error:', err);
      ResponseHandler.badRequest(res, err.message);
    }
    return next();
  }

  /**
   * GET /v1/playlist/providers
   *
   * Get list of available providers and conversion paths.
   */
  async getProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const providers = this.core.getAvailableProviders();
      const conversions = this.core.getAvailableConversions();

      ResponseHandler.ok(res, {
        providers,
        availableConversions: conversions.map(c => ({
          from: c.source,
          to: c.target,
          path: `${c.source} -> ${c.target}`
        }))
      });
    } catch (err: any) {
      console.error('[Providers] Error:', err);
      ResponseHandler.badRequest(res, err.message);
    }
    return next();
  }
}
