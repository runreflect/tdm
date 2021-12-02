export interface Fixture {} //TODO remove this

export class Fixture {
  static readonly References = Symbol('Relations')
}

export interface IFixture {
  [Fixture.References]?: Record<string, object>,
}

export abstract class FixtureTransformer<TFixture, TEntity, TPrimaryKey extends keyof TEntity> {
  fixtures: TFixture[]
  
  constructor(fixtures: TFixture[]) {
    this.fixtures = fixtures
  }

  abstract primaryKey(): TPrimaryKey

  abstract isMatchesEntity(entity: TEntity, fixture: TFixture): boolean
  
  abstract mapping(fixture: TFixture, relations?: any): Omit<TEntity, TPrimaryKey>
}
