import { expect } from 'chai'
import { NetworkHandler } from './../src/networkHandler'

describe('Utils - Network Handler Tests', async function () {

  const handler: NetworkHandler = new NetworkHandler();
  const urlForGet: string = 'https://jsonplaceholder.typicode.com/posts';
  const urlForPost: string = 'https://httpbin.org/post';

  it('GET', async function () {
    const testFetch = await handler.get(urlForGet);
    expect(testFetch.status).to.be.equal(200);
  });

  it('POST', async function () {
    let body = JSON.stringify({
      title: "test",
      body: "testBody!",
      userID: 1
    });

    const testFetch = await handler.post(urlForPost, body);
    expect(testFetch.status).to.be.equal(200);
    let postReturnedData = testFetch.data.json;
    for (let key in postReturnedData) {
      let found: boolean = false;
      for (let key2 in JSON.parse(body)) {
        if (key === key2) {
          expect(postReturnedData[key]).to.be.equal(JSON.parse(body)[key2]);
          found = true;
          break;
        }
      }
      if (!found) throw Error;
    }
  });

  it('CATCH', async function () {
    let invalidUrl: string = 'blablabla.com';
    try {
      let idk = await handler.get(invalidUrl)
    } catch (error) {
      expect(error);
    }
  })
})