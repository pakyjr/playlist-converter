import { Router } from 'express'
import ExpressPromiseRouter from "express-promise-router";
import cors from 'cors';
import { PlaylistRouter } from './routers/playlist'

export class MainRouter {
  private router: Router;
  private playlistRouter: PlaylistRouter;

  constructor() {
    //add single routes in the constructor of the main router
    this.playlistRouter = new PlaylistRouter()
    this.router = ExpressPromiseRouter()
    this.configRouter()
  }

  private configRouter() {
    this.router.use(cors());
    this.router.use("/playlist", this.playlistRouter.getRouter());
  }

  public getRouter() {
    return this.router
  }
}