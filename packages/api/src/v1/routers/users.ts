import { Router } from 'express'
import ExpressPromiseRouter from "express-promise-router";
import cors from 'cors'
import { UsersController } from '../controllers/users/controller'
import { BaseRouter } from '../../base';
import { CoreIndex } from '@iuly/iuly-core';

export class UsersRouter extends BaseRouter {
  private router: Router;
  private controller: UsersController;

  constructor(core: CoreIndex) {
    super()
    this.controller = new UsersController(core);
    this.router = ExpressPromiseRouter();
    this.configRouter();
  }

  private configRouter() {
    this.router.use(cors());
    this.router.route('/login').get(this.controller.sendLoginPage.bind(this.controller), this.sendResponse);
    this.router.route('/login/spotify').get(this.controller.spotifyAuth.bind(this.controller), this.sendResponse);
    this.router.route('/spotify/callback').get(this.controller.spotifyAuthCallback.bind(this.controller), this.sendResponse);
  }

  public getRouter() {
    return this.router
  }
}