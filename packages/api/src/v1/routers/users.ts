import { Router } from 'express'
import ExpressPromiseRouter from "express-promise-router";
import cors from 'cors'
import { UsersController } from '../controllers/users/controller'

export class UsersRouter {
  private router: Router;
  private controller: UsersController;
  constructor() {
    this.controller = new UsersController();
    this.router = ExpressPromiseRouter();
    this.configRouter();
  }

  private configRouter() {
    this.router.use(cors());
    this.router.route('/login/spotify').get(this.controller.spotifyAuth.bind(this.controller));
    this.router.route('/spotify/callback').get(this.controller.spotifyAuthCallback.bind(this.controller));
  }

  public getRouter() {
    return this.router
  }
}