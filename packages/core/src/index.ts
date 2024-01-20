import { AllDal } from '@iuly/iuly-interfaces'
import { SpotifyCore } from './spotify/core'
export * from './coreSingleton'

export class CoreIndex {
  spotifyCore: SpotifyCore

  constructor(allDal: AllDal) {
    this.spotifyCore = new SpotifyCore(allDal.spotify)
  }
}