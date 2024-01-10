import { CoreIndex } from ".";

export class CoreSingleton {

  private static coreIndex: CoreIndex

  static getCore() {
    if (!this.coreIndex) this.coreIndex = new CoreIndex()
    return this.coreIndex
  }
}