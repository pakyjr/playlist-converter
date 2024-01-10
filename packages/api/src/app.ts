import express from "express";
import cors from 'cors'
import compression from 'compression'
import { MainRouter } from './v1/mainRouter'
import { CoreIndex, CoreSingleton } from "@iuly/iuly-core";

export default function createApp() {
  const coreIndex: CoreIndex = CoreSingleton.getCore()

  const mainRouter: MainRouter = new MainRouter(coreIndex);
  const app = express();

  app.use(cors());
  app.use(compression());
  app.use("/v1", mainRouter.getRouter());
  app.use('*', (req, res) => {
    res.status(404).send('Endpoint not found');
  });

  return app;
}