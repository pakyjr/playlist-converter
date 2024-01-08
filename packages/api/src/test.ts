import { addQueryStringToURL } from './utils'

(function () {
  testQueryStringInUrl()
})()

function testQueryStringInUrl() {
  let url: string = `htpps://accounts.spotify.com/authorize`
  let client_id: string = process.env.SPOTIFY_CLIENT_ID!;
  let client_secret: string = process.env.SPOTIFY_SECRET!;
  let redirect_uri: string = process.env.SPOTIFY_REDIRECT_URI!;
  let scope: string = "user-read-private user-read-email user-library-read"

  let urlWithQueryParams = addQueryStringToURL(url, {
    response_type: "code",
    client_id,
    scope,
    redirect_uri
  })
  console.log(urlWithQueryParams);
}