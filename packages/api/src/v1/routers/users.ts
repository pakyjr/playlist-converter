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

    // Spotify auth
    this.router.route('/login/spotify').get(this.controller.spotifyAuth.bind(this.controller), this.sendResponse);
    this.router.route('/callback').get(this.controller.spotifyAuthCallback.bind(this.controller), this.sendResponse);

    // Apple Music auth
    this.router.route('/apple/token').get(this.controller.getAppleDeveloperToken.bind(this.controller), this.sendResponse);
    this.router.route('/apple/callback').post(this.controller.appleMusicCallback.bind(this.controller), this.sendResponse);
  }

  public getRouter() {
    return this.router
  }
}