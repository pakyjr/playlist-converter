import { NextFunction, Request, Response } from 'express';
import { addQueryStringToURL, generateRandomString } from '../utils'
import { NetworkHandler } from '@iuly/iuly-utils'
import { SpotifyToken } from '@iuly/iuly-models'

export class AuthenticationMiddleware {

  private networkHandler: NetworkHandler;

  constructor() {
    this.networkHandler = new NetworkHandler()
  }

  private readonly client_id: string = process.env.SPOTIFY_CLIENT_ID!;
  private readonly client_secret: string = process.env.SPOTIFY_SECRET!;
  private readonly redirect_uri: string = process.env.SPOTIFY_REDIRECT_URI!;

  generateSpotifyAuthURL(): string {
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

    return urlWithQueryParams
  }

  async spotifyAuthCallback(code: string): Promise<SpotifyToken> {
    let url: string = process.env.SPOTIFY_TOKEN_URL!;

    let params = new URLSearchParams();
    params.append('code', code)
    params.append('redirect_uri', this.redirect_uri);
    params.append('grant_type', 'authorization_code');

    let body = params.toString()
    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${this.client_id}:${this.client_secret}`).toString('base64')}`
    }

    const response = await this.networkHandler.post(url, body, { headers })
    return response.data
  }
}