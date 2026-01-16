import express from "express";
import cors from 'cors'
import compression from 'compression'
import session from 'express-session'
import { MainRouter } from './v1/mainRouter'
import { CoreIndex } from "@iuly/iuly-core";
import bodyParser from 'body-parser'

export default function createApp() {
  const coreIndex = new CoreIndex();

  const mainRouter: MainRouter = new MainRouter(coreIndex);
  const app = express();

  app.use(cors({
    origin: 'http://127.0.0.1:5173',
    credentials: true
  }));
  app.use(compression());
  app.use(bodyParser.json());
  app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET ?? '000-000',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false, //TODO understand this better before going to production
      maxAge: 1000 /*ms*/ * 60 /*s*/ * 60 /*m*/ //* 24 /*h*/
    }
  }));
  app.use("/v1", mainRouter.getRouter());
  app.use('*', (req, res) => {
    res.status(404).send('Endpoint not found');
  });

  return app;
}