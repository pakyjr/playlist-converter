import { PlaylistUseCase } from './useCase'
import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../../../responseHandler';

export class PlaylistController {
  private useCase: PlaylistUseCase;

  constructor() {
    this.useCase = new PlaylistUseCase();
  }

  async testGet(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.useCase.testGet();
      ResponseHandler.ok(res, response)
    } catch (err) {
      console.error(err);
      ResponseHandler.badRequest(res, JSON.stringify(err));
    }
    // return next()
  }
}