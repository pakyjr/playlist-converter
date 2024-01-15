// import {} from './useCase'
import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../../../responseHandler';
import { addQueryStringToURL } from '../../../utils';
import { CoreIndex } from 'packages/core/src';
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

  spotifyAuth(_req: Request, res: Response, next: NextFunction) {
    const urlWithQueryParams: string = this.useCase.generateSpotifyAuthURL();
    res.redirect(urlWithQueryParams);
    return next()
  }

  async spotifyAuthCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const code: string | null = req.query.code ? (req.query.code).toString() : null;
      const state: string | null = req.query.state ? (req.query.state).toString() : null;

      const sessionId: string = req.sessionID
      if (!sessionId) throw `USERS CONTROLLER (spotifyAuthCallback): sessionId missing!`

      if (code && state) {
        await this.useCase.generateSpotifyAuthToken(code, sessionId);
        res.redirect(`${process.env.BASE_URL}/v1/playlist/send/sendPlaylist.html`); //TODO the user should access this page only if authenticated. 
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
}
