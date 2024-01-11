import { AllDal } from '@iuly/iuly-interfaces'
import { SpotifyDAL } from '@iuly/iuly-dal'

export const allDalImplementations: AllDal = {
  spotify: new SpotifyDAL()
}