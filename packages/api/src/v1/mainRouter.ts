import { Router } from 'express'
import ExpressPromiseRouter from "express-promise-router";
import cors from 'cors';
import { PlaylistRouter } from './routers/playlist'
import { UsersRouter } from './routers/users';
import { CoreIndex } from '@iuly/iuly-core';

export class MainRouter {
  private router: Router;
  private playlistRouter: PlaylistRouter;
  private usersRouter: UsersRouter;

  constructor(core: CoreIndex) {
    //add single routes in the constructor of the main router
    this.playlistRouter = new PlaylistRouter()
    this.usersRouter = new UsersRouter(core)
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