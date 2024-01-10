import { Application, NextFunction, Request, Response } from "express";

export abstract class BaseRouter {

  constructor() { }

  sendResponse(_req: Request, res: Response, _next: NextFunction) {
    return res
  }
}