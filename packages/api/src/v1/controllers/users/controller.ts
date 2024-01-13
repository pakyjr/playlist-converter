// import {} from './useCase'
import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../../../responseHandler';
import { addQueryStringToURL } from '../../../utils';
import { CoreIndex } from 'packages/core/src';
import { UsersUseCase } from './useCase';
import { v4 as uuidv4 } from 'uuid'

export class UsersController {
  private useCase: UsersUseCase;

  constructor(core: CoreIndex) {
    this.useCase = new UsersUseCase(core);
  }

  spotifyAuth(req: Request, res: Response, next: NextFunction) {
    const sessionId: string = uuidv4();
    const urlWithQueryParams: string = this.useCase.generateSpotifyAuthURL();
    res.cookie('sessionId', sessionId, { httpOnly: true, secure: true });
    res.redirect(urlWithQueryParams);
    return next()
  }

  async spotifyAuthCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const code: string | null = req.query.code ? (req.query.code).toString() : null;
      const state: string | null = req.query.state ? (req.query.state).toString() : null;

      // const sessionId: string | null | undefined = req.cookies['sessionId'];
      // if (!sessionId) throw `USERS CONTROLLER (spotifyAuthCallback): sessionId missing!`

      let sessionId = "123"

      if (code && state) {
        await this.useCase.getSpotifyAuthToken(code, sessionId);
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
