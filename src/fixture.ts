export interface Fixture {}

type ForeignRelationMaterializer<TEntityKey, TResolvedKey, TRelatedResource, TValueFromFixture> = {
  isEqual(existing: TRelatedResource, candidate: TValueFromFixture): boolean,
  entity: {
    readAll(id: TEntityKey): Promise<TResolvedKey[]>,
  },
  relation: {
    read(id: TResolvedKey): Promise<TRelatedResource>,
  },
}

export abstract class FixtureTransformer<TFixture, TModel extends Fixture> { //TODO Second param should extend Model not Fixture
  fixtures: TFixture[]
  
  constructor(fixtures: TFixture[]) {
    this.fixtures = fixtures
  }

  abstract isEqual(existing: TModel, candidate: TFixture): boolean
  //TODO add mapping method?

  abstract relations(): Record<Exclude<keyof TFixture, keyof TModel>, ForeignRelationMaterializer<any, any, any, any>> //TODO better types for materializer
}
