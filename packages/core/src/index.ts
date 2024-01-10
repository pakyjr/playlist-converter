import { SpotifyCore } from './spotify/core'
export * from './coreSingleton'

export class CoreIndex {
  spotifyCore: SpotifyCore

  constructor() {
    this.spotifyCore = new SpotifyCore()
  }
}