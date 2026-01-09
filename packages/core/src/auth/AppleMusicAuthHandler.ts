/**
 * AppleMusicAuthHandler
 *
 * ABSTRACT FACTORY PATTERN - Concrete Product
 *
 * Handles JWT authentication for Apple Music.
 * Generates developer tokens using Apple's MusicKit private key.
 */

import { AuthHandler, AuthType } from '@iuly/iuly-interfaces';
import { AuthToken } from '@iuly/iuly-models';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

export class AppleMusicAuthHandler implements AuthHandler {

  private readonly teamId: string;
  private readonly keyId: string;
  private readonly privateKeyPath: string;
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.teamId = process.env.APPLE_TEAM_ID || '';
    this.keyId = process.env.APPLE_KEY_ID || '';
    this.privateKeyPath = process.env.APPLE_PRIVATE_KEY_PATH || '';
  }

  getAuthType(): AuthType {
    return 'jwt';
  }

  /**
   * Check if Apple Music credentials are configured
   */
  isConfigured(): boolean {
    return !!(this.teamId && this.keyId && this.privateKeyPath);
  }

  /**
   * For Apple Music, authorization happens via MusicKit JS on the frontend.
   * The frontend needs the developer token to initialize MusicKit.
   */
  generateAuthUrl(sessionId: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/v1/users/apple/authorize?session=${sessionId}`;
  }

  /**
   * Handle the authorization callback.
   * For Apple Music, the 'code' parameter is the Music User Token
   * obtained from MusicKit JS after user authorization.
   */
  async handleCallback(code: string, sessionId: string): Promise<AuthToken> {
    const developerToken = await this.generateDeveloperToken();

    return {
      accessToken: developerToken,
      expiresIn: 15777000, // ~6 months in seconds
      tokenType: 'Bearer',
      // Store the user token in scope for later use
      scope: `musicUserToken:${code}`
    };
  }

  /**
   * Apple Music developer tokens can be regenerated anytime.
   */
  async refreshToken(refreshToken: string): Promise<AuthToken> {
    const developerToken = await this.generateDeveloperToken();

    return {
      accessToken: developerToken,
      expiresIn: 15777000,
      tokenType: 'Bearer'
    };
  }

  async isTokenValid(token: string): Promise<boolean> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const now = Math.floor(Date.now() / 1000);

      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Get developer token (public method for API endpoints)
   */
  async getDeveloperToken(): Promise<string> {
    return this.generateDeveloperToken();
  }

  /**
   * Generate a JWT developer token for Apple Music API.
   */
  private async generateDeveloperToken(): Promise<string> {
    // Return cached token if still valid (with 5 min buffer)
    const now = Math.floor(Date.now() / 1000);
    if (this.cachedToken && this.tokenExpiry > now + 300) {
      return this.cachedToken;
    }

    if (!this.isConfigured()) {
      throw new Error(
        'Apple Music credentials not configured. ' +
        'Set APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY_PATH in .env'
      );
    }

    // Resolve the private key path
    const keyPath = path.isAbsolute(this.privateKeyPath)
      ? this.privateKeyPath
      : path.resolve(process.cwd(), this.privateKeyPath);

    if (!fs.existsSync(keyPath)) {
      throw new Error(`Apple Music private key not found at: ${keyPath}`);
    }

    const privateKey = fs.readFileSync(keyPath, 'utf8');

    // Token valid for 180 days (Apple's maximum)
    const expiresIn = 180 * 24 * 60 * 60;
    this.tokenExpiry = now + expiresIn;

    const token = jwt.sign({}, privateKey, {
      algorithm: 'ES256',
      expiresIn,
      issuer: this.teamId,
      header: {
        alg: 'ES256',
        kid: this.keyId
      }
    });

    this.cachedToken = token;
    console.log('[AppleMusicAuth] Generated new developer token');

    return token;
  }
}
