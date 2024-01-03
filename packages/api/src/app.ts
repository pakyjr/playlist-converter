import express, { Application, Request, Response } from "express";
import cors from 'cors'
import compression from 'compression'
import { MainRouter } from './v1/mainRouter'

export default function createApp() {
  const mainRouter: MainRouter = new MainRouter();
  const app = express();

  app.use(cors());
  app.use(compression());
  app.use("/v1", mainRouter.getRouter())
}