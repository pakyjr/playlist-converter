import { NetworkHandler } from './src/index'

const handler: NetworkHandler = new NetworkHandler();

(async function () {
  let url: string = 'https://jsonplaceholder.typicode.com/posts'
  const testFetch = await handler.get(url)
  console.log("hello");
})();