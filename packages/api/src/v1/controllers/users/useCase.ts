import { AuthenticationMiddleware } from '../../../middleware/authentication'
import { SpotifyToken } from '@iuly/iuly-models'
import { CoreIndex } from '@iuly/iuly-core'
import { redisClient } from '@iuly/iuly-utils'

export class UsersUseCase {
  private authMiddleware: AuthenticationMiddleware;

  constructor(private core: CoreIndex) {
    this.authMiddleware = new AuthenticationMiddleware();
  }

  generateSpotifyAuthURL(): string {
    return this.authMiddleware.generateSpotifyAuthURL();
  }

  async getSpotifyAuthToken(code: string, sessionId: string) {
    /*TODO to store and retrieve the session token, since it's interfacing with redis I should create 
    Spotify core class, that will talk with a spotify DAL to store the token and talk with the API, then 
    here on the useCase I should just call the core to store the token that will call the DAL*/
    let spotifyData: SpotifyToken = await this.authMiddleware.spotifyAuthCallback(code);
    this.core.spotifyCore.addSessionToken(sessionId)
  }
}