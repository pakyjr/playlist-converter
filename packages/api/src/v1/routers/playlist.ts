import { Router } from 'express'
import { CoreIndex } from '@iuly/iuly-core'
import ExpressPromiseRouter from "express-promise-router";
import cors from 'cors'
import { PlaylistController } from '../controllers/playlists/controller'
import { BaseRouter } from '../../base';

export class PlaylistRouter extends BaseRouter {
  private router: Router;
  private controller: PlaylistController;
  //add controller,
  constructor(private core: CoreIndex) {
    super()
    this.controller = new PlaylistController(core);
    this.router = ExpressPromiseRouter();
    this.configRouter();
  }

  private configRouter() {
    this.router.use(cors());
    this.router.route('/send').get(this.controller.sendPlaylist.bind(this.controller), this.sendResponse);
    this.router.route('/sent').post(this.controller.checkPlaylistURL.bind(this.controller), this.sendResponse);
    this.router.route('/spotify').get(this.controller.workSpotify.bind(this.controller), this.sendResponse);
  }

  public getRouter() {
    return this.router
  }
} 