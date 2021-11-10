import { Differ } from './differ'
import { Fixture, FixtureTransformer } from './fixture'
import { Executor } from './executor'

export class TDM {
  items: Array<{ transformer: FixtureTransformer<any, Fixture>, fixtures: any[], executor: Executor<any> }> //TODO can we get more specific typing here?

  constructor() {
    this.items = []
  }

  add<TTransformer extends FixtureTransformer<TFixture, TModel>, TExecutor extends Executor<TModel>, TFixture, TModel extends Fixture>(transformer: TTransformer, executor: TExecutor): void {
    this.items.push({ transformer: transformer, fixtures: transformer.fixtures, executor: executor })
  }

  async run(): Promise<void> {
    this.items.forEach(async ({ transformer, fixtures, executor }) => {
      try {
        console.log(`Processing fixtures for transformer: ${transformer.constructor.name}. Num fixtures: ${fixtures.length}`)

        const existing = await executor.readCollection()
        const diffResults = new Differ().diff(existing, fixtures as Fixture[], transformer.isEqual)
  
        //TODO for now we'll only create relations for existing things
        diffResults.noop.forEach(({ model, fixture }) => {
          //TODO relations should be queried after all the main entities have been updated, so this should include handling created and modified entities and also removing relations prior to a delete
          Object.keys(transformer.relations).forEach(async relation => {
            const relationTransformer = transformer.relations()[relation]
            //@ts-ignore
            const relationFixtures = fixture[relation]

            try {
              const xrefEntities = await relationTransformer.entity.readAll(model)
              const foreignEntities = await Promise.all(xrefEntities.map(async xrefEntity => {
                try {
                  const realEntity = await relationTransformer.relation.read(xrefEntity)

                  return realEntity
                } catch (e) {
                  console.error(`Error on 2nd relation call ${JSON.stringify(xrefEntity)}`, e)
                }
              }))

              const relationDiffResults = new Differ().diff(foreignEntities, relationFixtures, relationTransformer.isEqual)
            } catch (e) {
              console.error('Error on 1st relation call', e)
            }
          })
        })
      } catch (e) {
        console.error('error', e)
      }
    })
  }
}
