import { Router } from 'express'
import ExpressPromiseRouter from "express-promise-router";
import cors from 'cors'
import { PlaylistController } from '../controllers/playlists/controller'
import { BaseRouter } from '../../base';

export class PlaylistRouter extends BaseRouter {
  private router: Router;
  private controller: PlaylistController;
  //add controller,
  constructor() {
    super()
    this.controller = new PlaylistController();
    this.router = ExpressPromiseRouter();
    this.configRouter();
  }

  private configRouter() {
    this.router.use(cors());
    this.router.route('/send').get(this.controller.send.bind(this.controller), this.sendResponse);
  }

  public getRouter() {
    return this.router
  }
} 