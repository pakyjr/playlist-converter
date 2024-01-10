import { AuthenticationMiddleware } from '../../../middleware/authentication'

export class UsersUseCase {
  private authMiddleware: AuthenticationMiddleware;

  constructor() {
    this.authMiddleware = new AuthenticationMiddleware();
  }

  generateSpotifyAuthURL(): string {
    return this.authMiddleware.generateSpotifyAuthURL();
  }

  async getSpotifyAuthToken(code: string) {
    let spotifyData = await this.authMiddleware.spotifyAuthCallback(code);
    console.log(spotifyData);
  }
}