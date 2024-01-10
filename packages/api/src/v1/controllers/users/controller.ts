// import {} from './useCase'
import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../../../responseHandler';
import { addQueryStringToURL } from '../../../utils';
import { UsersUseCase } from './useCase'

export class UsersController {
  private useCase: UsersUseCase;

  constructor() {
    this.useCase = new UsersUseCase();
  }

  spotifyAuth(req: Request, res: Response, next: NextFunction) {
    let urlWithQueryParams: string = this.useCase.generateSpotifyAuthURL();
    res.redirect(urlWithQueryParams);
    return next()
  }

  async spotifyAuthCallback(req: Request, res: Response, next: NextFunction) {
    try {
      let code: string | null = req.query.code ? (req.query.code).toString() : null;
      let state: string | null = req.query.state ? (req.query.state).toString() : null;

      if (code && state) {
        await this.useCase.getSpotifyAuthToken(code);
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
