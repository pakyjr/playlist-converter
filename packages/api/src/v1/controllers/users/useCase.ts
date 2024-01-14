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

  async getSpotifyAuthToken(code: string, sessionId: string) {
    const spotifyToken: SpotifyToken = await this.authMiddleware.spotifyAuthCallback(code);
    await this.core.spotifyCore.addSessionToken(spotifyToken, sessionId);
  }

  //END REGION
}