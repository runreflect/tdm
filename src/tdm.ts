import { Differ, DiffResults } from './differ'
import { Fixture, FixtureTransformer } from './fixture'
import { Executor } from './executor'

export class TDM {
  items: Array<{ name: string, transformer: FixtureTransformer<any, any, any>, fixtures: any[], executor: Executor<any> }> //TODO can we get more specific typing here?

  constructor() {
    this.items = []
  }

  /**
   * Add a set of fixtures to be managed by TDM.
   */
  add<
    TExecutor extends Executor<TEntity>,
    TFixture,
    TEntity,
    TPrimaryKey extends keyof TEntity
  >(name: string, transformer: FixtureTransformer<TFixture, TEntity, TPrimaryKey>, executor: TExecutor): void {
    this.items.push({ name, transformer, fixtures: transformer.fixtures, executor })
  }

  /**
   * Run the diffing logic and optionally execute the required changes to get the data sources into their
   * expected state.
   */
  async run(options: { dryRun: boolean }): Promise<Record<string, DiffResults<object, object, never>>> {
    const aggregatedResults: Record<string, DiffResults<object, object, never>> = {} //TODO better type

    const allCollections = await this.retrieveRelatedCollections()

    await Promise.all(this.items.map(async ({ name, transformer, fixtures, executor }) => {
      const existing = allCollections.get(name)

      if (!existing) {
        throw new Error(`No collection exists for collection name: ${name}`)
      }
      console.log(`Processing fixtures for transformer: ${transformer.constructor.name}. Num fixtures: ${fixtures.length}`)

      const candidates = fixtures.map(fixture => {
        const relations = this.retrieveRelationsFunc(name, allCollections)(fixture)
        return { fixture, relations }
      })

      const diffResults = new Differ().diff({
        existing,
        //@ts-ignore
        candidates,
        //@ts-ignore
        primaryKey: transformer.primaryKey(),
        isMatchesEntity: transformer.isMatchesEntity,
        mapping: transformer.mapping
      })

      if (!options.dryRun) {
        console.log(`Creating ${diffResults.create.length} entities`, diffResults.create)
        await Promise.all(diffResults.create.map(async item => {
          try {
            if (item.entityToCreate) {
              return await executor.create(item.entityToCreate)
            } else {
              console.error('Cannot create entity as it is undefined', item)
              throw new Error('Cannot create entity as it is undefined')
            }
          } catch (e) {
            console.error("Error when creating entity", item.entityToCreate, e)
            throw e
          }
        }))

        console.log(`Modifying ${diffResults.modify.length} entities`)
        await Promise.all(diffResults.modify.map(async item => {
          try {
            return await executor.update(item.updatedEntity)
          } catch (e) {
            console.error("Error when modifying entity", item.updatedEntity, e)
            throw e
          }
        }))

        console.log(`Deleting ${diffResults.delete.length} entities`)
        await Promise.all(diffResults.delete.map(async item => {
          try {
            return await executor.delete(item.entity)
          } catch (e) {
            console.error("Error when deleting entity", item.entity, e)
            throw e
          }
        }))
      }

      aggregatedResults[name] = diffResults
    }))

    return aggregatedResults
  }

  /**
   * Materialize all data associated with relations inside the fixtures that we're managing.
   */
  private async retrieveRelatedCollections(): Promise<Map<string, any[]>> {
    const allCollections = new Map<string, any[]>() //TODO better type

    await Promise.all(this.items.map(async item => {
      console.log(`Retrieving all results for relation: ${item.name}`)

      const results = await item.executor.readCollection()
      allCollections.set(item.name, results)
    }))

    return allCollections
  }

  private retrieveRelationsFunc(name: string, allCollections: Map<string, any[]>) {
    const items = this.items
    const item = items.find(item => item.name === name)

    if (!item) {
      throw new Error(`Unable to link relation. No transformer has been added with name ${name}`)
    }

    function traverseForRelations(obj: object | any[]): object {
      if (!item) {
        throw new Error(`Unable to link relation. No transformer has been added with name ${name}`)
      }

      const result: Record<string, any> = {}

      if (hasOwnProperty(obj, Fixture.References)) {
        const relations = obj[Fixture.References] as object
    
        Object.keys(relations).forEach(relationName => {
          //@ts-ignore
          const toCompare = obj[Fixture.References][relationName] as any
          const transformer = items.find(item => item.name === relationName)?.transformer
    
          const collection = allCollections.get(relationName) || []
          const match = collection.find(collectionEntity => transformer && transformer.isMatchesEntity(collectionEntity, toCompare))

          if (!match) {
            console.debug(`No entity matches the fixture reference '${relationName}' with value '${JSON.stringify(toCompare)}'`)
          }
          //@ts-ignore
          result[relationName] = match
        })
      }

      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          result[key] = value.map(valueItem => traverseForRelations(valueItem))
        } else if (typeof value === 'object') { // object
          result[key] = traverseForRelations(value)
        }
      }
    
      return result
    }

    return function(fixture: any) {
      return traverseForRelations(fixture)
    }
  }
}

function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop)
}
