import { Router } from 'express'
import ExpressPromiseRouter from "express-promise-router";
import cors from 'cors'
import { PlaylistController } from '../controllers/playlists/controller'

export class PlaylistRouter {
  private router: Router;
  private controller: PlaylistController;
  //add controller,
  constructor() {
    this.controller = new PlaylistController();
    this.router = ExpressPromiseRouter();
    this.configRouter();
  }

  private configRouter() {
    this.router.use(cors())
    //define routes later, and bind the controller logic to the router here.
    this.router.route('/test').get(this.controller.testGet.bind(this.controller))
  }

  public getRouter() {
    return this.router
  }
}