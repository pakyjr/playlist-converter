import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../responseHandler';
import { addQueryStringToURL } from '../utils'
import { NetworkHandler } from '@iuly/iuly-utils'

export class AuthenticationMiddleware {

  private networkHandler: NetworkHandler;

  constructor() {
    this.networkHandler = new NetworkHandler()
  }

  private readonly client_id: string = process.env.SPOTIFY_CLIENT_ID!;
  private readonly client_secret: string = process.env.SPOTIFY_SECRET!;
  private readonly redirect_uri: string = process.env.SPOTIFY_REDIRECT_URI!;

  spotifyAuth(req: Request, res: Response, next: NextFunction) {
    let url: string = `https://accounts.spotify.com/authorize`
    let scope: string = "user-read-private user-read-email user-library-read"

    let urlWithQueryParams = addQueryStringToURL(url, {
      response_type: "code",
      client_id: this.client_id,
      scope,
      redirect_uri: this.redirect_uri
    });

    res.redirect(urlWithQueryParams);
    return next()
  }

  async spotifyAuthCallback(req: Request, res: Response, next: NextFunction) {
    let code = req.query.code || null;
    let state = req.query.state || null;

    if (state === null) {
      res.redirect('/#' + addQueryStringToURL(undefined, {
        error: 'state_mismatch'
      }));
    } else {
      let url: string = process.env.SPOTIFY_TOKEN_URL!;
      let body = {
        code,
        redirect_uri: this.redirect_uri,
        grant_type: 'authorization_code'
      };

      const result = await this.networkHandler.post(url, body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${this.client_id} : ${this.client_secret}`
        }
      })

      console.log(result)
    }
    return next()
  }
}