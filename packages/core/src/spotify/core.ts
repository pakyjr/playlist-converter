import { SpotifyDAL } from '@iuly/iuly-dal'
import { SpotifyDALInterface } from '@iuly/iuly-interfaces'
import { SpotifyToken, SpotifyAlbum, SpotifyArtist, SpotifyPlaylist, SpotifyTrack } from '@iuly/iuly-models'
import { SpotifyConverter } from './converter'

export class SpotifyCore {

  constructor(private spotifyDal: SpotifyDALInterface) { }

  async addSessionToken(token: SpotifyToken, sessionID: string) {
    await this.spotifyDal.addSessionToken(token, sessionID);
  }

  async getSessionToken(sessionID: string): Promise<string | null> {
    const token = await this.spotifyDal.getToken(sessionID);
    if (token) return token
    return null
  }

  async getSpotifyPlaylist(sessionID: string, playlistUrl: string): Promise<SpotifyPlaylist | null> {
    const token: string | null = await this.spotifyDal.getToken(sessionID);
    if (token) {
      const playlistID: string = this.getIdFromPlaylistUrl(playlistUrl);
      let rawPlaylist = await this.spotifyDal.getPlaylist(token, playlistID);
      if (rawPlaylist !== null) {
        let rawTrackItems = rawPlaylist.tracks.items
        let spotifyPlaylist: SpotifyPlaylist = this.handleSpotifyPlaylist(rawPlaylist, rawTrackItems);
        return spotifyPlaylist
      } else {
        return null
      }
    } else {
      return null
    }
  }

  // UTILS
  private handleSpotifyPlaylist(rawPlaylist: any, rawTrackItems: any): SpotifyPlaylist {
    let spotifyTracks: SpotifyTrack[] = [];
    for (let rawTrackItem of rawTrackItems) {
      let rawTrack = rawTrackItem.track;
      let rawAlbum = rawTrack.album;

      let spotifyTrack: SpotifyTrack = this.handleSpotifyTrack(rawTrack, rawAlbum);

      spotifyTracks.push(spotifyTrack);
    }
    let spotifyPlaylist: SpotifyPlaylist = SpotifyConverter.rawPlaylistIntoSpotifyPlaylist(rawPlaylist, spotifyTracks);
    return spotifyPlaylist
  }

  private handleSpotifyTrack(rawTrack: any, rawAlbum: any): SpotifyTrack {
    let rawAlbumArtists = rawAlbum.artists;
    let rawTrackArtists = rawTrack.artists;
    let spotifyArtistsForAlbum: SpotifyArtist[] = [];
    let spotifyArtistsForTrack: SpotifyArtist[] = [];

    for (let artist of rawTrackArtists) {
      spotifyArtistsForTrack.push(SpotifyConverter.rawArtistIntoSpotifyArtist(artist));
    }

    for (let artist of rawAlbumArtists) {
      spotifyArtistsForAlbum.push(SpotifyConverter.rawArtistIntoSpotifyArtist(artist));
    }

    let spotifyAlbum: SpotifyAlbum = SpotifyConverter.rawAlbumIntoSpotifyAlbum(rawAlbum, spotifyArtistsForAlbum);
    let spotifyTrack: SpotifyTrack = SpotifyConverter.rawTrackIntoSpotifyTrack(rawTrack, spotifyAlbum, spotifyArtistsForTrack);

    return spotifyTrack
  }

  private getIdFromPlaylistUrl(playlistUrl: string): string {
    let parts = playlistUrl.split('/');
    return parts[parts.length - 1];

  }
}