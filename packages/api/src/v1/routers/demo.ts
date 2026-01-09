/**
 * DemoRouter
 *
 * Routes for demonstrating design patterns without authentication.
 * Uses mock data to show patterns working end-to-end.
 */

import { Router } from 'express';
import { CoreIndex } from '@iuly/iuly-core';
import ExpressPromiseRouter from 'express-promise-router';
import cors from 'cors';
import { DemoController } from '../controllers/playlists/demoController';
import { BaseRouter } from '../../base';

export class DemoRouter extends BaseRouter {
  private router: Router;
  private controller: DemoController;

  constructor(core: CoreIndex) {
    super();
    this.controller = new DemoController(core);
    this.router = ExpressPromiseRouter();
    this.configRouter();
  }

  private configRouter() {
    this.router.use(cors());

    // Demo endpoints (no auth required)
    this.router.route('/test').get(this.controller.test.bind(this.controller), this.sendResponse);
    this.router.route('/providers').get(this.controller.providers.bind(this.controller), this.sendResponse);
    this.router.route('/mock-playlist/:provider').get(this.controller.mockPlaylist.bind(this.controller), this.sendResponse);
    this.router.route('/convert').post(this.controller.convert.bind(this.controller), this.sendResponse);
  }

  public getRouter() {
    return this.router;
  }
}
