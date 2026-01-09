import { PlaylistUseCase } from './useCase'
import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../../../responseHandler';
import { CoreIndex } from '@iuly/iuly-core'
import { checkValidPlaylistURL, addQueryStringToURL } from '../../../utils'
import { MusicProvider, ValidPlaylistUrl, ConversionResult } from '@iuly/iuly-models'
import path from 'path'
import fs from 'fs'

export class PlaylistController {
  private useCase: PlaylistUseCase;

  constructor(private core: CoreIndex) {
    this.useCase = new PlaylistUseCase(core);
  }

  /**
   * POST /v1/playlist/convert
   *
   * Convert a playlist from one provider to another.
   * Uses STRATEGY PATTERN to select appropriate conversion algorithm.
   *
   * Body: {
   *   sourceProvider: "Spotify" | "Apple Music",
   *   targetProvider: "Spotify" | "Apple Music",
   *   playlistUrl: string
   * }
   */
  async convertPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionID: string = req.sessionID;
      const { sourceProvider, targetProvider, playlistUrl } = req.body;

      // Validate required fields
      if (!sourceProvider || !targetProvider || !playlistUrl) {
        ResponseHandler.badRequest(res, 'Missing required fields: sourceProvider, targetProvider, playlistUrl');
        return next();
      }

      // Validate providers
      const validProviders = [MusicProvider.Spotify, MusicProvider.AppleMusic];
      if (!validProviders.includes(sourceProvider)) {
        ResponseHandler.badRequest(res, `Invalid sourceProvider. Must be one of: ${validProviders.join(', ')}`);
        return next();
      }
      if (!validProviders.includes(targetProvider)) {
        ResponseHandler.badRequest(res, `Invalid targetProvider. Must be one of: ${validProviders.join(', ')}`);
        return next();
      }
      if (sourceProvider === targetProvider) {
        ResponseHandler.badRequest(res, 'sourceProvider and targetProvider must be different');
        return next();
      }

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
          }))
        }
      });

    } catch (err: any) {
      console.error('[Convert] Error:', err);
      ResponseHandler.badRequest(res, err.message || 'Conversion failed');
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

  async sendPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionID = req.sessionID;
      const authenticated: boolean = await this.useCase.sendPlaylistCheckAuth(sessionID);

      if (authenticated) {
        const filePath = `/Users/pakyjr/projects/playlist-converter/backend/packages/api/src/public/sendPlaylist.html`; //FIXME temporary path
        const checkFile: boolean = fs.existsSync(filePath);
        if (checkFile) res.sendFile(filePath); //TODO FIX THE PATH 
        else ResponseHandler.noContent(res);
      } else {
        ResponseHandler.unauthorized(res);
      }

      //TODO ADD LOGOUT LOGIC
    } catch (err) {
      console.error(err);
      ResponseHandler.badRequest(res, JSON.stringify(err));
    }
    return next()
  }

  async checkPlaylistURL(req: Request, res: Response, next: NextFunction) {
    /*we will receive a playlist URL, first of all retrieve the sessionID and the url
    check the url validity, retrieve user token, figure out if the url is spotify or apple music.*/
    try {
      const playlistUrl: string = req.body.url;
      let validUrlInfo: ValidPlaylistUrl = checkValidPlaylistURL(playlistUrl);

      if (validUrlInfo.valid) {
        if (validUrlInfo.provider === MusicProvider.Spotify) {
          /*trigger Spotify converter logic*/
          res.redirect(addQueryStringToURL(`${process.env.BASE_URL}/v1/playlist/spotify`, {
            url: playlistUrl
          })); //XXX check html script
        } else if (validUrlInfo.provider === MusicProvider.AppleMusic) {
          /*trigger apple music converter logic*/
          res.send('apple music')
        }
      } else {
        throw new Error('Invalid Url!');
      }
    } catch (err) {
      ResponseHandler.badRequest(res, JSON.stringify(err));
    }
    return next()
  }

  async workSpotify(req: Request, res: Response, next: NextFunction) {
    //send sessionId to usecase.
    const sessionID: string = req.sessionID;
    //the playlist url is a mandatory queryParam.
    const playlistUrl: string | undefined = req.query.url ? (req.query.url).toString() : undefined;
    if (playlistUrl) {
      let spotifyPlaylist = await this.useCase.workSpotify(sessionID, playlistUrl)
      if (spotifyPlaylist) {
        res.send(spotifyPlaylist)
      } else {
        ResponseHandler.badRequest(res)
      }
    }
    else ResponseHandler.badRequest(res)
    return next()
  }
}