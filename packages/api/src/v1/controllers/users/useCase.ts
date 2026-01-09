import { AuthenticationMiddleware } from '../../../middleware/authentication'
import { SpotifyToken, AuthToken } from '@iuly/iuly-models'
import { CoreIndex, ProviderFactoryRegistry } from '@iuly/iuly-core'
import { MusicProvider } from '@iuly/iuly-models'

export class UsersUseCase {
  private authMiddleware: AuthenticationMiddleware;

  constructor(private core: CoreIndex) {
    this.authMiddleware = new AuthenticationMiddleware();
  }

  //SPOTIFY REGION

  generateSpotifyAuthURL(): string {
    return this.authMiddleware.generateSpotifyAuthURL();
  }

  async generateSpotifyAuthToken(code: string, sessionId: string): Promise<string> {
    const spotifyToken: SpotifyToken = await this.authMiddleware.spotifyAuthCallback(code);
    await this.core.spotifyCore.addSessionToken(spotifyToken, sessionId);
    return spotifyToken.access_token
  }

  //END REGION

  //APPLE MUSIC REGION

  async getAppleDeveloperToken(): Promise<string> {
    const factory = ProviderFactoryRegistry.getFactory(MusicProvider.AppleMusic);
    const authHandler = factory.createAuthHandler() as any;
    return authHandler.getDeveloperToken();
  }

  async handleAppleMusicUserToken(musicUserToken: string, sessionId: string): Promise<AuthToken> {
    const factory = ProviderFactoryRegistry.getFactory(MusicProvider.AppleMusic);
    const authHandler = factory.createAuthHandler();
    const dal = factory.createDAL();

    // The callback stores the user token and returns the full auth token
    const authToken = await authHandler.handleCallback(musicUserToken, sessionId);

    // Store the token for this session
    await dal.addSessionToken(authToken, sessionId);

    return authToken;
  }

  //END REGION
}