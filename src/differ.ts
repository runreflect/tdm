import clone from 'lodash/clone'
import intersection from 'lodash/intersection'
import isNil from 'lodash/isNil'
import omit from 'lodash/omit'
import omitBy from 'lodash/omitBy'

export interface DiffResults<TEntity extends object, TFixture extends object, TPrimaryKey extends keyof TEntity> {
  noop: { entity: TEntity, fixture: TFixture }[],
  modify: { entity: TEntity, fixture: TFixture, updatedEntity: TEntity }[],
  create: { entityToCreate: Omit<TEntity, TPrimaryKey>, fixture: TFixture }[],
  delete: { entity: TEntity }[],
}

export class Differ<TEntity extends object, TFixture extends object, TPrimaryKey extends keyof TEntity> {
  diff(options: {
    existing: TEntity[],
    candidates: { fixture: TFixture, relations: object }[],
    primaryKey: TPrimaryKey,
    isMatchesEntity: (entity: TEntity, fixture: TFixture) => boolean,
    mapping: (fixture: TFixture, relations?: object) => Omit<TEntity, TPrimaryKey>,
  }): DiffResults<TEntity, TFixture, TPrimaryKey> { //TODO Add 'isFullDataUpdate'
    const noop: { entity: TEntity, fixture: TFixture }[] = []
    const toModify: { entity: TEntity, fixture: TFixture, updatedEntity: TEntity }[] = []
    const toCreate: { fixture: TFixture, entityToCreate: Omit<TEntity, TPrimaryKey> }[] = []
    const toDelete: { entity: TEntity }[] = []

    const existingEntities = clone(options.existing)
    const candidates = clone(options.candidates)

    for (let i = 0; i < existingEntities.length; i++) {
      const existingEntity = existingEntities[i]
      let haveModifiedEntity: { candidate: TFixture, updatedEntity: TEntity } | null = null
      let foundEqualCandidate: TFixture | null = null

      for (let j = 0; j < candidates.length; j++) {
        const candidate = candidates[j]

        if (candidate === undefined) { // Will happen if we've deleted an element within the array
          continue
        }

        if (options.isMatchesEntity(existingEntity, candidate.fixture)) {
          const existingEntityWithoutPrimaryKey = omit(existingEntity, [options.primaryKey])
          const candidateMappedToEntity = options.mapping(candidate.fixture, candidate.relations)

          if (isSharedKeysHaveSameValues(candidateMappedToEntity, existingEntityWithoutPrimaryKey)) {
            foundEqualCandidate = candidate.fixture
          } else {
            let updatedEntity = candidateMappedToEntity as TEntity
            updatedEntity[options.primaryKey] = existingEntity[options.primaryKey]

            haveModifiedEntity = {
              candidate: candidate.fixture,
              updatedEntity, // apply existing primary key to updated entity
            } 
          }

          delete candidates[j]
          break
        }
      }

      if (haveModifiedEntity) {
        toModify.push({ entity: existingEntity, fixture: haveModifiedEntity.candidate, updatedEntity: haveModifiedEntity.updatedEntity })
      } else if (foundEqualCandidate) {
        noop.push({ fixture: foundEqualCandidate, entity: existingEntity })
      } else {
        toDelete.push({ entity: existingEntity })
      }
    }

    candidates.filter(obj => obj != undefined).forEach(candidate => {
      toCreate.push({ fixture: candidate.fixture, entityToCreate: options.mapping(candidate.fixture, candidate.relations) })
    })

    return {
      noop: noop,
      modify: toModify,
      create: toCreate,
      delete: toDelete,
    }
  }
}

function isSharedKeysHaveSameValues(obj1: object, obj2: object): boolean {
  //TODO do deep comparsion instead of only comparing first level of properties

  // Get properties that are shared across both objects and have defined values in both objects
  const commonProperties = intersection(
    Object.keys(omitBy(obj1, isNil)),
    Object.keys(omitBy(obj2, isNil))
  )

  for (const property of commonProperties) {
    //@ts-ignore
    if (obj1[property] !== obj2[property]) { // @ts-ignore
      return false
    }
  }

  return true
}
