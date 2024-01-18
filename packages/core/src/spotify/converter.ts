import { SpotifyPlaylist, SpotifyArtist, SpotifyTrack, SpotifyAlbum } from '@iuly/iuly-models'

export class SpotifyConverter {

  static rawPlaylistIntoSpotifyPlaylist(rawPlaylist: any, tracks: SpotifyTrack[]): SpotifyPlaylist {
    let spotifyPlaylist: SpotifyPlaylist = {
      name: rawPlaylist.name,
      description: rawPlaylist.description,
      playlist_id: rawPlaylist.id,
      public: rawPlaylist.public,
      tracks
    }

    return spotifyPlaylist
  }

  static rawTrackIntoSpotifyTrack(rawTrack: any, spotifyAlbum: SpotifyAlbum, spotifyArtists: SpotifyArtist[]): SpotifyTrack {
    let spotifyTrack: SpotifyTrack = {
      is_local: rawTrack.is_local,
      artists: spotifyArtists,
      available_markets: rawTrack.available_markets,
      track_id: rawTrack.id,
      name: rawTrack.name,
      duration_ms: rawTrack.duration_ms,
      album: spotifyAlbum
    }

    return spotifyTrack
  }

  static rawArtistIntoSpotifyArtist(rawArtist: any): SpotifyArtist {
    let spotifyArtist: SpotifyArtist = {
      name: rawArtist.name,
      artist_id: rawArtist.id,
      uri: rawArtist.uri
    }

    return spotifyArtist
  }

  static rawAlbumIntoSpotifyAlbum(rawAlbum: any, spotifyArtists: SpotifyArtist[]): SpotifyAlbum {
    let spotifyAlbum: SpotifyAlbum = {
      artists: spotifyArtists,
      uri: rawAlbum.uri,
      id: rawAlbum.id,
      release_date: rawAlbum.release_date,
      total_tracks: rawAlbum.total_tracks
    }

    return spotifyAlbum
  }

}