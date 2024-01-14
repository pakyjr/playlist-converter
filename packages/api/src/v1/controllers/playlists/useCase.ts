

export class PlaylistUseCase {

  constructor() { }

  async testGet(): Promise<string> {
    let testPromise: Promise<string> = new Promise((res, rej) => {
      res("auth successful, paste the playlists");
    });

    testPromise.then((res: string) => {
      return res
    }).catch((err) => {
      console.log(err)
    })

    return testPromise
  }
}