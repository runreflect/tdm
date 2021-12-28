import { Differ, DiffResults } from './differ'
import { Mapper } from './mapper'
import { Fixture, Relations } from './fixture'
import { Executor } from './executor'
import { CollectionProgressBar } from './cli/collection-progress-bar'
import { Printer } from './printer'
import matches from 'lodash/matches'
import clone from 'lodash/clone'

type AggregatedResults = Record<string, DiffResults<unknown, Mapper<unknown>>>

type CreateItem = {
  entityToCreate?: unknown
  error?: string
}

type ModifyItem = {
  entity: unknown;
  updatedEntity?: Mapper<unknown>
  error?: string
}

type DeleteItem = {
  entity: unknown
  error?: string
}

export const RunError: unique symbol = Symbol('RunError')

export class TDM {
  items: Array<{ name: string, fixtures: Fixture<any, any>[], mapper: Mapper<any>, executor: Executor<any> }> //TODO can we get more specific typing here?

  constructor() {
    this.items = []
  }

  /**
   * Add a set of fixtures to be managed by TDM.
   */
  add<
    T1,
    TMapper extends Mapper<T1>,
    TFixture extends Fixture<TMapper, T1>,
    TExecutor extends Executor<T1>
  >(fixtures: TFixture[], mapper: TMapper, executor: TExecutor): void {
    const name = mapper.constructor.name
    this.items.push({ name, fixtures, mapper, executor })
  }

  /**
   * Run the diffing logic and optionally execute the required changes to get the data sources into their
   * expected state.
   */
  async run(options: { dryRun: boolean }): Promise<AggregatedResults> {
    const aggregatedResults: AggregatedResults = {}
    const executors: Record<string, Executor<any>> = {}

    const allCollections = await this.retrieveRelatedCollections()

    await Promise.all(this.items.map(async ({ name, fixtures, mapper, executor }) => {
      const existing = allCollections.get(name)

      if (!existing) {
        throw new Error(`No collection exists for collection name: ${name}`)
      }
      Printer.print(`Processing (${fixtures.length}) fixtures for mapper: ${mapper.constructor.name}`)

      const candidates = fixtures.map(fixture => {
        const relations = this.retrieveRelations(mapper, allCollections, fixture)
        return combine(fixture, relations)
      })

      const diffResults = new Differ().diff({ existing, candidates, mapper })

      aggregatedResults[name] = diffResults
      executors[name] = executor
    }))

    printResults(aggregatedResults)

    if (!options.dryRun) {
      for (const [name, diffResults] of Object.entries(aggregatedResults)) {
        const executor = executors[name]

        Printer.print(`Creating ${diffResults.create.length} entities`, diffResults.create)
        await Promise.all(diffResults.create.map(item => doCreate(item, executor)))
  
        Printer.print(`Modifying ${diffResults.modify.length} entities`)
        await Promise.all(diffResults.modify.map(item => doModify(item, executor)))
  
        Printer.print(`Deleting ${diffResults.delete.length} entities`)
        await Promise.all(diffResults.delete.map(item => doDelete(item, executor)))
      }
    }
    
    return aggregatedResults
  }

  /**
   * Materialize all data associated with relations inside the fixtures that we're managing.
   */
  private async retrieveRelatedCollections(): Promise<Map<string, any[]>> {
    const progressBar = new CollectionProgressBar(this.items)
    const allCollections = new Map<string, any[]>() //TODO better type

    Printer.print(`Retrieving existing data for ${this.items.length} collections...`)
    await Promise.all(this.items.map(async (item, idx) => {
      const results = await item.executor.readAll()
      progressBar.complete(item.name)

      allCollections.set(item.name, results)
    }))

    progressBar.stop()

    return allCollections
  }

  private retrieveRelations(mapper: Mapper<any>, allCollections: Map<string, any[]>, fixture: Fixture<any, any>) {
    return Object.entries(fixture[Relations] || {}).map(([property, relation]) => {
      const relationDetails = mapper.fields[property] //TODO validate it is a relation

      if (!relationDetails) {
        return { [property]: { [RunError]: `No mapper defined for relation ${property}` } }
      }

      //@ts-ignore
      const relationMapper = relationDetails['mapper']
      const items = allCollections.get(relationMapper.constructor.name)

      if (!items) {
        return { [property]: { [RunError]: 'Relation not found' } }
      }

      const match = items.find(item => matches(relation)(item))

      if (!match) {
        return { [property]: { [RunError]: 'Match not found' } }
      }

      //@ts-ignore
      const field = mapper.fields[property]['field']

      return { [property]: match[field] }
    })
  }
}

function combine(fixture: Fixture<any, any>, relations: any[]) {
  let result = clone(fixture)
  for (let item of relations) {
    result = { ...result, ...item }
  }

  //@ts-ignore
  delete result[Relations]

  return result
}

async function doCreate(item: CreateItem, executor: Executor<any>): Promise<void> {
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
}

async function doModify(item: ModifyItem, executor: Executor<any>): Promise<void> {
  if (!item.error) {
    try {
      return await executor.update(item.updatedEntity)
    } catch (e) {
      console.error("Error when modifying entity", item.updatedEntity, e)
      throw e
    }
  } else {
    console.error(`Unable to modify entity. Error occurred during mapping: ${item.error}`)
  }
}

async function doDelete(item: DeleteItem, executor: Executor<any>): Promise<void> {
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
}

function printResults(aggregatedResults: AggregatedResults) {
  for (const [name, diffResults] of Object.entries(aggregatedResults)) {
    Printer.print('')
    Printer.print(`${name}:`)
    Printer.print('---')
    Printer.print(`Noop: ${diffResults.noop.length} entries`)
    Printer.print(`Create: ${diffResults.create.length} entries`)
    
    diffResults.create.forEach((entry, idx) => {
      Printer.print(`[${idx}]:`)
      if (entry.error) {
        Printer.print(`ERROR: ${entry.error}`)
      } else {
        Printer.printDiff({}, entry.entityToCreate as object ?? {})
      }
    })

    Printer.print(`Modify: ${diffResults.modify.length} entries`)
    diffResults.modify.forEach((entry, idx) => {
      Printer.print(`[${idx}]:`)
      if (entry.error) {
        Printer.print(`ERROR: ${entry.error}`)
      } else {
        Printer.printDiff(entry.entity as object, entry.updatedEntity ?? {})
      }
    })

    Printer.print(`Delete: ${diffResults.delete.length} entries`)
    diffResults.delete.forEach((entry, idx) => {
      Printer.print(`[${idx}]:`)
      if (entry.error) {
        Printer.print(`ERROR: ${entry.error}`)
      } else {
        Printer.printDiff(entry.entity as object, {})
      }
    })
  }
}
