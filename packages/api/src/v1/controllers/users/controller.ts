// import {} from './useCase'
import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../../../responseHandler';
import { addQueryStringToURL } from '../../../utils'
import { AuthenticationMiddleware } from '../../../middleware/authentication'

export class UsersController {
  // private useCase: PlaylistUseCase;
  private authMiddleware: AuthenticationMiddleware;

  constructor() {
    this.authMiddleware = new AuthenticationMiddleware()
    // this.useCase = new PlaylistUseCase();
  }

  spotifyAuth(req: Request, res: Response, next: NextFunction) {
    this.authMiddleware.spotifyAuth(req, res, next);
    return next()
  }

  async spotifyAuthCallback(req: Request, res: Response, next: NextFunction) {
    try {
      await this.authMiddleware.spotifyAuthCallback(req, res, next);
    } catch (err) {
      ResponseHandler.badRequest(res, JSON.stringify(err));
    }
    return next();
  }

}
