import clone from 'lodash/clone'

export interface DiffResults<TModel, TFixture> {
  noop: { model: TModel, fixture: TFixture }[],
  modify: { model: TModel, fixture: TFixture }[],
  create: { fixture: TFixture }[],
  delete: { model: TModel }[],
}

export class Differ<TModel, TFixture> {
  diff(existing: TModel[], candidates: TFixture[], isEqual: (model: any, fixture: any) => boolean): DiffResults<TModel, TFixture> { //TODO Add 'isFullDataUpdate' and handle isEqual

    const noop: { model: TModel, fixture: TFixture }[] = []
    const toModify: { model: TModel, fixture: TFixture }[] = []
    const toCreate: { fixture: TFixture }[] = []
    const toDelete: { model: TModel }[] = []

    const existingObjs = clone(existing)
    const candidateObjs = clone(candidates)

    for (let i = 0; i < existingObjs.length; i++) {
      const existingObj = existingObjs[i]
      let foundCandidate: TFixture | null = null

      for (let j = 0; j < candidateObjs.length; j++) {
        const candidateObj = candidateObjs[j]

        if (candidateObj === undefined) { // Will happen if we've deleted all elements in the array
          break
        }

        if (isEqual(existingObj, candidateObj)) { //TODO this doesn't need to be a class method...
          //TODO handle 'modify' case here by calling 'mapping' method
          foundCandidate = candidateObj
          delete candidateObjs[j]
          break
        }
      }

      if (foundCandidate) {
        noop.push({ fixture: foundCandidate, model: existingObj })
      } else {
        toDelete.push({ model: existingObj })
      }
    }

    candidateObjs.filter(obj => obj != undefined).forEach(candidateObj => {
      toCreate.push({ fixture: candidateObj })
    })

    return {
      noop: noop,
      modify: [], //TODO populate this
      create: toCreate,
      delete: toDelete,
    }
  }
}
