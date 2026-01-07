/**
 * AuthHandler Interface
 *
 * Part of the ABSTRACT FACTORY PATTERN implementation.
 *
 * Handles authentication for different providers.
 * Spotify uses OAuth 2.0, Apple Music uses JWT.
 * This interface abstracts the differences.
 */

import { AuthToken } from '@iuly/iuly-models';

export type AuthType = 'oauth' | 'jwt';

export interface AuthHandler {
  /**
   * Generate the authorization URL for the user to authenticate
   * For OAuth: Returns redirect URL to provider's auth page
   * For JWT: May return a different flow or the token directly
   * @param sessionId - The session identifier
   * @returns Authorization URL or token
   */
  generateAuthUrl(sessionId: string): string;

  /**
   * Handle the authentication callback
   * For OAuth: Exchange code for tokens
   * For JWT: Validate and process the response
   * @param code - Authorization code (OAuth) or other auth data
   * @param sessionId - The session identifier
   * @returns Authentication token
   */
  handleCallback(code: string, sessionId: string): Promise<AuthToken>;

  /**
   * Refresh an expired token
   * @param refreshToken - The refresh token
   * @returns New authentication token
   */
  refreshToken(refreshToken: string): Promise<AuthToken>;

  /**
   * Get the authentication type this handler uses
   * @returns 'oauth' or 'jwt'
   */
  getAuthType(): AuthType;

  /**
   * Check if a token is valid/not expired
   * @param token - The token to validate
   * @returns True if valid
   */
  isTokenValid(token: string): Promise<boolean>;
}
