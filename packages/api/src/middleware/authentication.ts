import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../responseHandler';
import { addQueryStringToURL, generateRandomString } from '../utils'
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
    let stateLength: number = 16;
    let url: string = `https://accounts.spotify.com/authorize`;
    let scope: string = "user-read-private user-read-email user-library-read";
    let state: string = generateRandomString(stateLength);

    let urlWithQueryParams = addQueryStringToURL(url, {
      response_type: "code",
      client_id: this.client_id,
      redirect_uri: this.redirect_uri,
      scope,
      state
    });

    res.redirect(urlWithQueryParams);
  }

  async spotifyAuthCallback(req: Request, res: Response, _next: NextFunction) {
    let code = req.query.code || null;
    let state = req.query.state || null;

    if (state === null) {
      res.redirect('/#' + addQueryStringToURL(undefined, {
        error: 'state_mismatch'
      }));
    } else {
      let url: string = process.env.SPOTIFY_TOKEN_URL!;

      // let body = `code=${code}&redirect_uri=${this.redirect_uri}&grant_type=authorization_code`
      let params = new URLSearchParams();
      params.append('code', code as string)
      params.append('redirect_uri', this.redirect_uri);
      params.append('grant_type', 'authorization_code');

      let body = params.toString()
      let headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.client_id}:${this.client_secret}`).toString('base64')}`
      }

      const response = await this.networkHandler.post(url, body, { headers })
      return response.data.access_token
    }
  }
}