import { PlaylistUseCase } from './useCase'
import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../../../responseHandler';
import { CoreIndex } from '@iuly/iuly-core'
import path from 'path'
import fs from 'fs'

export class PlaylistController {
  private useCase: PlaylistUseCase;

  constructor(private core: CoreIndex) {

    this.useCase = new PlaylistUseCase(core);
  }

  async sendPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      let sessionID = req.sessionID;
      let authenticated: boolean = await this.useCase.sendPlaylistCheckAuth(sessionID);

      if (authenticated) {
        let filePath = `/Users/pakyjr/projects/playlist-converter/backend/packages/api/src/public/sendPlaylist.html`; //FIXME temporary path
        let checkFile: boolean = fs.existsSync(filePath);
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
}