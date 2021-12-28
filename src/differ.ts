import clone from 'lodash/clone'
import isEqual from 'lodash/isEqual'
import { Mapper, Property } from './mapper'

export interface DiffResults<T1, TMapper extends Mapper<T1>>{
  noop: { entity: T1, error?: string }[],
  modify: { entity: T1, updatedEntity?: TMapper, error?: string }[],
  create: { entityToCreate?: T1 | undefined, error?: string }[],
  delete: { entity: T1, error?: string }[],
}

export class Differ<T1, TMapper extends Mapper<T1>> {
  diff(options: {
    existing: T1[],
    candidates: any[],
    mapper: TMapper,
  }): DiffResults<T1, TMapper> {
    const noop: { entity: T1 }[] = []
    const toModify: { entity: T1, updatedEntity?: T1, error?: string }[] = []
    const toCreate: { entityToCreate?: T1, error?: string }[] = []
    const toDelete: { entity: T1 }[] = []

    const candidates = clone(options.candidates)

    for (let i = 0; i < options.existing.length; i++) {
      const existingEntity = options.existing[i]
      let haveModifiedEntity: { candidate: T1, updatedEntity?: T1, error?: string } | undefined
      let foundEqualCandidate: T1 | undefined

      for (let j = 0; j < candidates.length; j++) {
        const candidate = candidates[j]

        if (candidate === undefined) { // Will happen if we've deleted an element within the array
          continue
        }

        if (isMatchesEntity(existingEntity, candidate, options.mapper)) {
          // Find fields that are different between existing value and fixture
          const differentFields = compare(existingEntity, candidate, options.mapper)

          if (differentFields.length === 0) {
            foundEqualCandidate = candidate
          } else {
            let updatedEntity: T1 = clone(existingEntity)
            
            differentFields.forEach(field => {
              //@ts-ignore
              updatedEntity[field] = candidate[field]
            })

            haveModifiedEntity = {
              candidate: candidate,
              updatedEntity, // apply existing primary key to updated entity
            } 
          }

          delete candidates[j]
          break
        }
      }

      if (haveModifiedEntity) {
        toModify.push({ entity: existingEntity, updatedEntity: haveModifiedEntity.updatedEntity, error: haveModifiedEntity.error })
      } else if (foundEqualCandidate) {
        noop.push({ entity: existingEntity })
      } else {
        toDelete.push({ entity: existingEntity })
      }
    }

    candidates.filter(obj => obj != undefined).forEach(candidate => {
      toCreate.push({ entityToCreate: candidate })
    })

    return {
      noop: noop,
      //@ts-ignore
      modify: toModify,
      create: toCreate,
      delete: toDelete,
    }
  }
}

function isMatchesEntity<
  T1,
  TMapper extends Mapper<T1>
>(existingEntity: T1, candidate: T1, mapper: TMapper): boolean {
  const fields = Object.entries(mapper.fields).
    filter(([_, value]) => value === Property.Comparator).
    map(([key, _]) => key)
  
  for (const field of fields) {
    //@ts-ignore
    if (existingEntity[field] !== candidate[field]) {
      return false
    }
  }

  return true
}

function compare<
  T1,
  TMapper extends Mapper<T1>
>(existingEntity: T1, candidate: T1, mapper: TMapper): (keyof T1)[] {
  const differentFields: (keyof T1)[] = []

  const fields = Object.entries(mapper.fields).
    filter(([_, value]) => value === Property.Field).
    map(([key, _]) => key)
  
  for (const field of fields) {
    //@ts-ignore
    if (existingEntity[field] == undefined && candidate[field] == undefined) {
      //NO-OP - Both entity and fixture have  null/undefined for this field, so we'll ignore it
    //@ts-ignore
    } else if (!isEqual(existingEntity[field], candidate[field])) {
      //@ts-ignore
      differentFields.push(field)
    }
  }

  return differentFields
}
