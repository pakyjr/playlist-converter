import { CoreIndex } from ".";
import { AllDal } from '@iuly/iuly-interfaces'
import { allDalImplementations } from '@iuly/iuly-utils'
export class CoreSingleton {

  private static coreIndex: CoreIndex

  static getCore() {
    if (!this.coreIndex) {
      const allDal: AllDal = allDalImplementations;
      this.coreIndex = new CoreIndex(allDal);
    }
    return this.coreIndex
  }
}