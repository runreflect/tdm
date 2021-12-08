import { Differ, DiffResults } from './differ'
import { Fixture, FixtureTransformer } from './fixture'
import { Executor } from './executor'
import * as Diff from 'diff'
import { CollectionProgressBar } from './cli/collection-progress-bar'

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
      console.log(`Processing (${fixtures.length}) fixtures for transformer: ${transformer.constructor.name}`)

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
          if (!item.error) {
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
          } else {
            console.error(`Unable to create entity. Error occurred during mapping: ${item.error}`)
          }
        }))

        console.log(`Modifying ${diffResults.modify.length} entities`)
        await Promise.all(diffResults.modify.map(async item => {
          if (!item.error) {
            console.log('modfying entity', item)
            try {
              return await executor.update(item.updatedEntity)
            } catch (e) {
              console.error("Error when modifying entity", item.updatedEntity, e)
              throw e
            }
          } else {
            console.error(`Unable to modify entity. Error occurred during mapping: ${item.error}`)
          }
        }))

        console.log(`Deleting ${diffResults.delete.length} entities`)
        await Promise.all(diffResults.delete.map(async item => {
          if (!item.error) {
            try {
              return await executor.delete(item.entity)
            } catch (e) {
              console.error("Error when deleting entity", item.entity, e)
              throw e
            }
          } else {
            console.error(`Unable to delete entity. Error occurred during mapping: ${item.error}`)
          }
        }))
      }

      aggregatedResults[name] = diffResults
    }))

    // Print results
    for (const [name, diffResults] of Object.entries(aggregatedResults)) {
      console.log('')
      console.log(`${name}:`)
      console.log('---')
      console.log(`Noop: ${diffResults.noop.length} entries`)
      console.log(`Create: ${diffResults.create.length} entries`)
      
      diffResults.create.forEach((entry, idx) => {
        console.log(`[${idx}]:`)
        if (entry.error) {
          console.log(`ERROR: ${entry.error}`)
        } else {
          printDiff({}, entry.entityToCreate ?? {})
        }
      })

      console.log(`Modify: ${diffResults.modify.length} entries`)
      diffResults.modify.forEach((entry, idx) => {
        console.log(`[${idx}]:`)
        if (entry.error) {
          console.log(`ERROR: ${entry.error}`)
        } else {
          printDiff(entry.entity, entry.updatedEntity ?? {})
        }
      })

      console.log(`Delete: ${diffResults.delete.length} entries`)
      diffResults.delete.forEach((entry, idx) => {
        console.log(`[${idx}]:`)
        if (entry.error) {
          console.log(`ERROR: ${entry.error}`)
        } else {
          printDiff(entry.entity, {})
        }
      })
    }

    return aggregatedResults
  }

  /**
   * Materialize all data associated with relations inside the fixtures that we're managing.
   */
  private async retrieveRelatedCollections(): Promise<Map<string, any[]>> {
    const progressBar = new CollectionProgressBar(this.items)
    const allCollections = new Map<string, any[]>() //TODO better type

    console.log(`Retrieving existing data for ${this.items.length} collections...`)
    await Promise.all(this.items.map(async (item, idx) => {
      const results = await item.executor.readCollection()
      progressBar.complete(item.name)

      allCollections.set(item.name, results)
    }))

    progressBar.stop()

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

function printDiff(existingValue: object, newValue: object) {
  const diff = Diff.diffJson(existingValue, newValue, { ignoreWhitespace: false })
  diff.forEach((part) => {
    // green for additions, red for deletions
    // grey for common parts
    const color = part.added ? 'green' :
    part.removed ? 'red' : 'grey';
    
    console.log(part.value[color]);
  })
}