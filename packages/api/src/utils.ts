import { ValidPlaylistUrl } from '@iuly/iuly-models'

export function addQueryStringToURL(url: string | undefined, params: Record<string, string | number | boolean>): string {
  const queryParams = new URLSearchParams();

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      queryParams.append(key, params[key].toString());
    }
  }

  if (url) return `${url}?${queryParams.toString()}`
  return `?${queryParams.toString()}`
}

export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let char of characters) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export function checkValidPlaylistURL(url: string): ValidPlaylistUrl {
  //spotifyExample: https://open.spotify.com/playlist/1nIGJ4iqlhFkn6KL0sVmQd *regex valid / non existent playlist*
  //appleMusicExample: https://music.apple.com/library/playlist/a.EYWrg10un7zAZJR *regex valid / non existent playlist*
  const spotifyRegEx = /^https:\/\/open\.spotify\.com\/(playlist|collection)\/[\w\d]+/;
  const appleMusicRegEx = /^https:\/\/music\.apple\.com\/(library\/playlist|us\/library\/songs)\S+/;

  let result: ValidPlaylistUrl = {
    valid: false,
  };
  // Check if the URL matches either Spotify or Apple Music patterns
  if (spotifyRegEx.test(url)) {
    result = {
      valid: true,
      provider: "Spotify",
      url: url,
    };
  } else if (appleMusicRegEx.test(url)) {
    result = {
      valid: true,
      provider: "Apple Music",
      url: url,
    };
  }
  return result;
}