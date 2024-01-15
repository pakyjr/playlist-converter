import express from "express";
import cors from 'cors'
import compression from 'compression'
import session from 'express-session'
import path from 'path'
import { MainRouter } from './v1/mainRouter'
import { CoreIndex, CoreSingleton } from "@iuly/iuly-core";

export default function createApp() {
  const coreIndex: CoreIndex = CoreSingleton.getCore()

  const mainRouter: MainRouter = new MainRouter(coreIndex);
  const app = express();

  app.use(cors());
  app.use(compression());
  app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET ?? '000-000',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, //TODO understand this better before going to production
      maxAge: 1000 /*ms*/ * 60 /*s*/ * 60 /*m*/ //* 24 /*h*/
    }
  }));
  app.use(express.static('public')); //FIXME how awful is this? 
  app.use("/v1", mainRouter.getRouter());
  app.use('*', (req, res) => {
    res.status(404).send('Endpoint not found');
  });

  return app;
}