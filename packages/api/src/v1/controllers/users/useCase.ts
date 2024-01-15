import { AuthenticationMiddleware } from '../../../middleware/authentication'
import { SpotifyToken } from '@iuly/iuly-models'
import { CoreIndex } from '@iuly/iuly-core'

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
}