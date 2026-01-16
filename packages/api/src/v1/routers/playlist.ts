import { Router } from 'express'
import { CoreIndex } from '@iuly/iuly-core'
import ExpressPromiseRouter from "express-promise-router";
import cors from 'cors'
import { PlaylistController } from '../controllers/playlists/controller'
import { BaseRouter } from '../../base';
import { validateConversionRequest } from '../../middleware/validators';

export class PlaylistRouter extends BaseRouter {
  private router: Router;
  private controller: PlaylistController;

  constructor(private core: CoreIndex) {
    super()
    this.controller = new PlaylistController(core);
    this.router = ExpressPromiseRouter();
    this.configRouter();
  }

  private configRouter() {
    this.router.use(cors());
    this.router.route('/convert').post(
      validateConversionRequest,
      this.controller.convertPlaylist.bind(this.controller),
      this.sendResponse
    );
    this.router.route('/convert/stream').post(
      validateConversionRequest,
      this.controller.convertPlaylistWithProgress.bind(this.controller)
    );
    this.router.route('/providers').get(this.controller.getProviders.bind(this.controller), this.sendResponse);
    this.router.route('/limits').get(this.controller.getLimits.bind(this.controller), this.sendResponse);
  }

  public getRouter() {
    return this.router
  }
} 