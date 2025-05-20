# 🎵 Playlist Converter (Apple Music ↔ Spotify)

A duplex playlist converter built with TypeScript. Seamlessly transfer playlists between Apple Music and Spotify.

✨ Features
	•	🔁 Convert playlists both ways: Apple Music ↔ Spotify
	•	🔍 Match tracks across platforms by metadata
	•	⚡ Fast, lightweight, and developer-friendly
	•	🔐 Secure auth with OAuth 2.0

🛠 Tech Stack
	•	TypeScript
	•	Node.js
	•	Apple Music API
	•	Spotify Web API

🚀 Getting Started

1.	Clone the repo:
 ```
git clone https://github.com/yourusername/playlist-converter.git 
cd playlist-converter
```
2.	Install dependencies:
```
npm install
```
3.	Create a .env file and add your API credentials:

🔑 Spotify API Keys

•	Go to the Spotify Developer Dashboard.

•	Log in and create a new app.

•	Copy the Client ID and Client Secret.

•	Set a redirect URI (e.g., http://localhost:3000/callback) and add it to your app settings.

🍎 Apple Music API Token

•	Log into your Apple Developer account.

•	Create a MusicKit identifier and generate a private key.

•	Use the private key, key ID, and team ID to generate a JWT for authenticating with Apple Music’s API. (You can use a script or a tool like musickit-token-generator.)
```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback

APPLE_MUSIC_TEAM_ID=your_team_id
APPLE_MUSIC_KEY_ID=your_key_id
APPLE_MUSIC_PRIVATE_KEY=your_private_key_contents
```

 
