import { Router } from 'express'
import ExpressPromiseRouter from "express-promise-router";
import cors from 'cors';
import { PlaylistRouter } from './routers/playlist'
import { UsersRouter } from './routers/users';

export class MainRouter {
  private router: Router;
  private playlistRouter: PlaylistRouter;
  private usersRouter: UsersRouter;

  constructor() {
    //add single routes in the constructor of the main router
    this.playlistRouter = new PlaylistRouter()
    this.usersRouter = new UsersRouter()
    this.router = ExpressPromiseRouter()
    this.configRouter()
  }

  private configRouter() {
    this.router.use(cors());
    this.router.use("/playlist", this.playlistRouter.getRouter());
    this.router.use("/users", this.usersRouter.getRouter());
  }

  public getRouter() {
    return this.router
  }
}