export interface Fixture {}

export interface FixturePrimaryKeyMapper<T extends Fixture> {
  isEqual(obj1: T, obj2: T): boolean
}

export interface FixtureExecutor<T extends Fixture> {
  create(fixture: T): void
  read(fixture: T): void
  update(fixture: T): void
  delete(fixture: T): void
}

export interface FixtureTransformer<T extends Fixture> {
  fixtures: T[],
  mapper: FixturePrimaryKeyMapper<T>,
  executor: FixtureExecutor<T>,
}
