import { PlaylistUseCase } from './useCase'
import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../../../responseHandler';
import { CoreIndex } from '@iuly/iuly-core'
import { checkValidPlaylistURL } from '../../../utils'
import { MusicProvider, ValidPlaylistUrl } from '@iuly/iuly-models'
import path from 'path'
import fs from 'fs'

export class PlaylistController {
  private useCase: PlaylistUseCase;

  constructor(private core: CoreIndex) {

    this.useCase = new PlaylistUseCase(core);
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
      const sessionID: string = req.sessionID;
      const token = await this.core.spotifyCore.getSessionToken(sessionID);

      const playlistUrl: string = req.body.url; //FIXME not receiving playlist url. 

      let validUrlInfo: ValidPlaylistUrl = checkValidPlaylistURL(playlistUrl);
      if (validUrlInfo.valid) {
        if (validUrlInfo.provider === MusicProvider.Spotify) {
          /*trigger Spotify converter logic*/
          res.send('spotify')
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
}