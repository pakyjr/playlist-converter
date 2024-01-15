import { PlaylistUseCase } from './useCase'
import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../../../responseHandler';
import path from 'path'
import fs from 'fs'

export class PlaylistController {
  private useCase: PlaylistUseCase;

  constructor() {
    this.useCase = new PlaylistUseCase();
  }

  send(req: Request, res: Response, next: NextFunction) {
    try {
      let filePath = `/Users/pakyjr/projects/playlist-converter/backend/packages/api/src/public/${req.params.fileName}`; //FIXME temporary path
      let checkFile = fs.existsSync(filePath);
      if (checkFile) res.sendFile(filePath); //TODO FIX THE PATH 
      else throw new Error('non existent file')
    } catch (err) {
      console.error(err);
      ResponseHandler.noContent(res, JSON.stringify(err));
    }
    return next()
  }
}