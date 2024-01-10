import { AuthenticationMiddleware } from '../../../middleware/authentication'
import { SpotifyToken } from '@iuly/iuly-models'

export class UsersUseCase {
  private authMiddleware: AuthenticationMiddleware;

  constructor() {
    this.authMiddleware = new AuthenticationMiddleware();
  }

  generateSpotifyAuthURL(): string {
    return this.authMiddleware.generateSpotifyAuthURL();
  }

  async getSpotifyAuthToken(code: string) {
    let spotifyData: SpotifyToken = await this.authMiddleware.spotifyAuthCallback(code);
    console.log(spotifyData);
  }
}