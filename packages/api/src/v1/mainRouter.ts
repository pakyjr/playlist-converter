import { Router } from 'express'
import ExpressPromiseRouter from "express-promise-router";
import cors from 'cors';
import { PlaylistRouter } from './routers/playlist'
import { UsersRouter } from './routers/users';
import { DemoRouter } from './routers/demo';
import { CoreIndex } from '@iuly/iuly-core';

export class MainRouter {
  private router: Router;
  private playlistRouter: PlaylistRouter;
  private usersRouter: UsersRouter;
  private demoRouter: DemoRouter;

  constructor(core: CoreIndex) {
    //add single routes in the constructor of the main router
    this.playlistRouter = new PlaylistRouter(core)
    this.usersRouter = new UsersRouter(core)
    this.demoRouter = new DemoRouter(core)
    this.router = ExpressPromiseRouter()
    this.configRouter()
  }

  private configRouter() {
    this.router.use(cors());
    this.router.use("/playlist", this.playlistRouter.getRouter());
    this.router.use("/users", this.usersRouter.getRouter());
    this.router.use("/demo", this.demoRouter.getRouter());
  }

  public getRouter() {
    return this.router
  }
}