import { NetworkHandler } from './index'

const handler: NetworkHandler = new NetworkHandler();

(async function () {
  testEnv()
})();

async function randomPOST() {
  let url: string = 'https://jsonplaceholder.typicode.com/posts'
  const testFetch = await handler.get(url)
  console.log("hello");
}

function testEnv() {
  console.log('start')
  // dotenv.config({ path: findEnv() });
  console.log(process.env.SPOTIFY_SECRET);
  console.log('stop')
}