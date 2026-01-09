import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../../../responseHandler';
import { addQueryStringToURL } from '../../../utils';
import { CoreIndex } from '@iuly/iuly-core';
import { UsersUseCase } from './useCase';
import fs from 'fs'

export class UsersController {
  private useCase: UsersUseCase;

  constructor(core: CoreIndex) {
    this.useCase = new UsersUseCase(core);
  }

  sendLoginPage(_req: Request, res: Response, next: NextFunction) {
    try {
      let filePath = `/Users/pakyjr/projects/playlist-converter/backend/packages/api/src/public/login.html`; //FIXME temporary path
      let checkFile = fs.existsSync(filePath);
      if (checkFile) res.sendFile(filePath); //TODO FIX THE PATH
      else throw new Error('non existent file')
    } catch (err) {
      console.error(err);
      ResponseHandler.noContent(res, JSON.stringify(err));
    }
    return next()
  }

  // SPOTIFY AUTH

  spotifyAuth(_req: Request, res: Response, next: NextFunction) {
    const urlWithQueryParams: string = this.useCase.generateSpotifyAuthURL();
    res.redirect(urlWithQueryParams);
    return next()
  }

  async spotifyAuthCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const code: string | null = req.query.code ? (req.query.code).toString() : null;
      const state: string | null = req.query.state ? (req.query.state).toString() : null;

      const sessionId: string = req.sessionID;
      if (!sessionId) throw `USERS CONTROLLER (spotifyAuthCallback): sessionId missing!`

      if (code && state) {
        await this.useCase.generateSpotifyAuthToken(code, sessionId);
        // Redirect to frontend with success flag
        res.redirect(`http://127.0.0.1:5173/?spotify=success`);
      } else {
        res.redirect('/#' + addQueryStringToURL(undefined, {
          error: 'state_mismatch'
        }));
        throw `USERS CONTROLLER (spotifyAuthCallback): code or state missing!`
      }

    } catch (err) {
      ResponseHandler.badRequest(res, JSON.stringify(err));
    }
    return next();
  }

  // APPLE MUSIC AUTH

  /**
   * GET /v1/users/apple/token
   * Returns the Apple Music developer token for MusicKit JS initialization
   */
  async getAppleDeveloperToken(req: Request, res: Response, next: NextFunction) {
    try {
      const developerToken = await this.useCase.getAppleDeveloperToken();
      ResponseHandler.ok(res, { developerToken });
    } catch (err: any) {
      console.error('[AppleToken] Error:', err.message);
      ResponseHandler.badRequest(res, err.message);
    }
    return next();
  }

  /**
   * POST /v1/users/apple/callback
   * Receives the Music User Token from MusicKit JS after user authorization
   * Body: { musicUserToken: string }
   */
  async appleMusicCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { musicUserToken } = req.body;

      if (!musicUserToken) {
        ResponseHandler.badRequest(res, 'musicUserToken is required');
        return next();
      }

      const sessionId: string = req.sessionID;
      if (!sessionId) {
        ResponseHandler.badRequest(res, 'Session ID missing');
        return next();
      }

      const authToken = await this.useCase.handleAppleMusicUserToken(musicUserToken, sessionId);

      ResponseHandler.ok(res, {
        success: true,
        message: 'Apple Music authorized successfully',
        expiresIn: authToken.expiresIn
      });
    } catch (err: any) {
      console.error('[AppleCallback] Error:', err.message);
      ResponseHandler.badRequest(res, err.message);
    }
    return next();
  }
}
