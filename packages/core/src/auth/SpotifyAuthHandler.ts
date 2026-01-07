/**
 * SpotifyAuthHandler
 *
 * ABSTRACT FACTORY PATTERN - Concrete Product
 *
 * Handles OAuth 2.0 authentication for Spotify.
 */

import { AuthHandler, AuthType } from '@iuly/iuly-interfaces';
import { AuthToken } from '@iuly/iuly-models';
import { NetworkHandler } from '@iuly/iuly-utils';

export class SpotifyAuthHandler implements AuthHandler {
  private networkHandler: NetworkHandler;

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly tokenUrl: string;

  constructor() {
    this.networkHandler = new NetworkHandler();
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_SECRET || '';
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || '';
    this.tokenUrl = process.env.SPOTIFY_TOKEN_URL || 'https://accounts.spotify.com/api/token';
  }

  getAuthType(): AuthType {
    return 'oauth';
  }

  generateAuthUrl(sessionId: string): string {
    const state = this.generateRandomString(16);
    const scope = 'user-read-private user-read-email user-library-read playlist-modify-public playlist-modify-private';

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope,
      state,
      show_dialog: 'true'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async handleCallback(code: string, sessionId: string): Promise<AuthToken> {
    const params = new URLSearchParams({
      code,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code'
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
    };

    const response = await this.networkHandler.post(
      this.tokenUrl,
      params.toString(),
      { headers }
    );

    // Convert Spotify's response format to our AuthToken format
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      tokenType: response.data.token_type,
      scope: response.data.scope
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthToken> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
    };

    const response = await this.networkHandler.post(
      this.tokenUrl,
      params.toString(),
      { headers }
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token || refreshToken,
      expiresIn: response.data.expires_in,
      tokenType: response.data.token_type,
      scope: response.data.scope
    };
  }

  async isTokenValid(token: string): Promise<boolean> {
    try {
      const response = await this.networkHandler.get(
        'https://api.spotify.com/v1/me',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.status === 200;
    } catch {
      return false;
    }
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
