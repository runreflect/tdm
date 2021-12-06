import { Differ } from "../src/differ"
import { Fixture } from "../src/fixture"

interface ExampleEntity {
  id: number,
  name: string,
  description: string,
}

interface ExampleFixture {
  name: string,
  description: string,
}

interface MoreComplexEntity {
  id: number,
  name: string,
  description?: string | null,
  somethingElse?: number,
}

interface MoreComplexFixture {
  name: string,
  description?: string | null,
  somethingElse?: number,
}

test('set as create when isEqual result is false', () => {
  const differ = new Differ<ExampleEntity, ExampleFixture, 'id'>()

  const exampleEntity = { id: 1, name: 'foo', description: 'something' }

  const exampleFixture = { name: 'bar', description: 'something' }

  function isMatchesEntity(entity: ExampleEntity, fixture: ExampleFixture) {
    return entity.name === fixture.name
  }

  function mapping(fixture: ExampleFixture): Omit<ExampleEntity, 'id'> {
    return {
      name: fixture.name,
      description: fixture.description,
    }
  }

  const candidates = [{ fixture: exampleFixture, relations: {} }]

  expect(
    differ.diff({ existing: [exampleEntity], candidates, primaryKey: 'id', isMatchesEntity, mapping })
  ).toEqual({
    noop: [],
    modify: [],
    create: [{
      fixture: exampleFixture,
      entityToCreate: { name: 'bar', description: 'something' },
    }],
    delete: [{
      entity: exampleEntity,
    }],
  })
})

test('set as noop when isEqual result is true and mapping matches', () => {
  const differ = new Differ<ExampleEntity, ExampleFixture, 'id'>()

  const exampleEntity = { id: 1, name: 'foo', description: 'foo description' }

  const exampleFixture = { name: 'foo', description: 'foo description' }

  function isMatchesEntity(entity: ExampleEntity, fixture: ExampleFixture) {
    return entity.name === fixture.name
  }

  function mapping(fixture: ExampleFixture): Omit<ExampleEntity, 'id'> {
    return {
      name: fixture.name,
      description: fixture.description,
    }
  }

  const candidates = [{ fixture: exampleFixture, relations: {} }]

  expect(
    differ.diff({ existing: [exampleEntity], candidates, primaryKey: 'id', isMatchesEntity, mapping })
  ).toEqual({
    noop: [{
      fixture: exampleFixture,
      entity: exampleEntity,
    }],
    modify: [],
    create: [],
    delete: [],
  })
})

test('set as modify when isEqual result is true and mapping does not match', () => {
  const differ = new Differ<MoreComplexEntity, MoreComplexFixture, 'id'>()

  const exampleEntity = {
    id: 1,
    name: 'foo',
    description: 'Foo description',
    somethingElse: 5,
  }

  const exampleFixture = {
    name: 'foo',
    description: 'Foo description',
    somethingElse: 10,
  }

  function isMatchesEntity(entity: MoreComplexEntity, fixture: MoreComplexFixture) {
    return entity.name === fixture.name
  }

  function mapping(fixture: MoreComplexFixture): Omit<MoreComplexEntity, 'id'> {
    return {
      name: fixture.name,
      description: fixture.description,
      somethingElse: fixture.somethingElse,
    }
  }

  const candidates = [{ fixture: exampleFixture, relations: {} }]

  expect(
    differ.diff({ existing: [exampleEntity], candidates, primaryKey: 'id', isMatchesEntity, mapping })
  ).toEqual({
    noop: [],
    modify: [{
      fixture: exampleFixture,
      entity: exampleEntity,
      updatedEntity: {
        id: 1,
        name: 'foo',
        description: 'Foo description',
        somethingElse: 10,
      },
    }],
    create: [],
    delete: [],
  })
})

test('should consider null and undefined properties to be equal', () => {
  const differ = new Differ<MoreComplexEntity, MoreComplexFixture, 'id'>()

  const exampleEntity = { id: 1, name: 'foo', description: undefined }

  const exampleFixture = { name: 'foo', description: null }

  function isMatchesEntity(entity: MoreComplexEntity, fixture: MoreComplexFixture) {
    return entity.name === fixture.name
  }

  function mapping(fixture: MoreComplexFixture): Omit<MoreComplexEntity, 'id'> {
    return {
      name: fixture.name,
      description: fixture.description,
    }
  }

  const candidates = [{ fixture: exampleFixture, relations: {} }]

  expect(
    differ.diff({ existing: [exampleEntity], candidates, primaryKey: 'id', isMatchesEntity, mapping })
  ).toEqual({
    noop: [{
      fixture: exampleFixture,
      entity: exampleEntity,
    }],
    modify: [],
    create: [],
    delete: [],
  })
})
