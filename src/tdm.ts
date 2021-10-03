import { Fixture, FixtureTransformer, FixtureExecutor, FixturePrimaryKeyMapper } from './fixture'

export class TDM {
  run<T extends FixtureTransformer<T2>, T2 extends Fixture>(transformer: T): void {
    // TODO Call data source (transformer.executor.readAll)

    // TODO Call differ and run diff against existing data vs. data in fixtures

    // TODO write new values (transformer.executor.create)
    // TODO modify existing values (transformer.executor.update)
    // TODO delete unused values (transformer.executor.delete)

    //TODO remove below
    transformer.fixtures.forEach(fixture => {
      console.log('fixture', fixture)
    })
  }
}
