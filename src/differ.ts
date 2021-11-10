import difference from 'lodash/difference'
import intersection from 'lodash/intersection'
import md5 from 'md5'

export interface DiffResults<T> {
  noop: Array<T | undefined>, //TODO fix these
  modify: Array<T | undefined>,
  create: Array<T | undefined>,
  delete: Array<T | undefined>,
}

export class Differ<T> {
  diff(objs1: T[], objs2: T[]): DiffResults<T> { //TODO Add 'isFullDataUpdate'

    // Get matching id / generate hashcode for each object
    const objs1Map = new Map<string | number[], T>()
    const objs2Map = new Map<string | number[], T>()
    
    objs1.forEach(obj => {
      objs1Map.set(hashcodeOrMatchingId(obj), obj)
    })

    objs2.forEach(obj => {
      objs2Map.set(hashcodeOrMatchingId(obj), obj)
    })

    const objs1Keys = Array.from(objs1Map.keys())
    const objs2Keys = Array.from(objs2Map.keys())

    //TODO this may actually be slower than a simpler approach...
    const noopOrModify = intersection(objs1Keys, objs2Keys) //TODO Things that exist should either be no-op or modified
    const toDelete = difference(objs1Keys, objs2Keys) //TODO Things in objs1 but not objs2 should be deleted
    const toCreate = difference(objs2Keys, objs1Keys) //TODO Things in objs2 but not objs1 should be created
    
    return {
      noop: noopOrModify.map(key => objs1Map.get(key)),
      modify: [], //TODO populate this
      create: toCreate.map(key => objs2Map.get(key)),
      delete: toDelete.map(key => objs1Map.get(key)),
    }
  }
}

function hashcodeOrMatchingId<T>(obj: T): string | number[] {
  const thing = JSON.stringify(obj)

  return md5(thing)
}
