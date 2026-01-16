import { AuthToken } from '@iuly/iuly-models'
import { CoreIndex, ProviderFactoryRegistry } from '@iuly/iuly-core'
import { MusicProvider } from '@iuly/iuly-models'
import { SpotifyAuthHandler, AppleMusicAuthHandler } from '../../../auth'

/**
 * UsersUseCase
 *
 * Handles authentication logic for music providers.
 * Uses auth handlers from the API layer (not core).
 */
export class UsersUseCase {
  private spotifyAuth: SpotifyAuthHandler;
  private appleMusicAuth: AppleMusicAuthHandler;

  constructor(private core: CoreIndex) {
    this.spotifyAuth = new SpotifyAuthHandler();
    this.appleMusicAuth = new AppleMusicAuthHandler();
  }

  // SPOTIFY

  generateSpotifyAuthURL(): string {
    return this.spotifyAuth.generateAuthUrl('');
  }

  async generateSpotifyAuthToken(code: string, sessionId: string): Promise<string> {
    const authToken = await this.spotifyAuth.handleCallback(code, sessionId);
    // Store token using the factory-created DAL
    const dal = ProviderFactoryRegistry.getFactory(MusicProvider.Spotify).createDAL();
    await dal.addSessionToken(authToken, sessionId);
    return authToken.accessToken;
  }

  // APPLE MUSIC

  async getAppleDeveloperToken(): Promise<string> {
    return this.appleMusicAuth.getDeveloperToken();
  }

  async handleAppleMusicUserToken(musicUserToken: string, sessionId: string): Promise<AuthToken> {
    const authToken = await this.appleMusicAuth.handleCallback(musicUserToken, sessionId);
    // Store token using the factory-created DAL
    const dal = ProviderFactoryRegistry.getFactory(MusicProvider.AppleMusic).createDAL();
    await dal.addSessionToken(authToken, sessionId);
    return authToken;
  }
}