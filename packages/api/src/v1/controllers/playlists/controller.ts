import { PlaylistUseCase } from './useCase'
import { NextFunction, Request, Response } from 'express';

export class PlaylistController {
  private useCase: PlaylistUseCase;

  constructor() {
    this.useCase = new PlaylistUseCase();
  }

  async testGet(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.useCase.testGet();
      res.status(200);
      res.send(response);
      res.end();
      //TODO how to implement http responses?
    } catch (err) {
      console.error(err) //FIXME Temporary, we should send to the client 400 
    }
    return next()
  }
}