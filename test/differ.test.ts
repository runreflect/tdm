import { Differ } from "../src/differ"
import { Mapper, Property } from "../src/mapper"

interface Example {
  id: number,
  name: string,
  description: string,
}

class ExampleMapper extends Mapper<Example> {
  fields = {
    id: Property.Identifier,
    name: Property.Comparator,
    description: Property.Field,
  }
}

interface MoreComplex {
  id: number,
  name: string,
  description?: string | null,
  somethingElse?: number,
}

class MoreComplexMapper extends Mapper<MoreComplex> {
  fields = {
    id: Property.Identifier,
    name: Property.Comparator,
    description: Property.Field,
    somethingElse: Property.Field,
  }
}

test('set as create when isEqual result is false', () => {
  const differ = new Differ<Example, ExampleMapper>()

  const existing = [{ id: 1, name: 'foo', description: 'something' }]

  const candidates = [{ name: 'bar', description: 'something' }]

  const mapper = new ExampleMapper()

  expect(
    differ.diff({ existing, candidates, mapper })
  ).toEqual({
    noop: [],
    modify: [],
    create: [{
      entityToCreate: candidates[0],
    }],
    delete: [{
      entity: existing[0],
    }],
  })
})

test('set as noop when isEqual result is true and mapping matches', () => {
  const differ = new Differ<Example, ExampleMapper>()

  const existing = [{ id: 1, name: 'foo', description: 'foo description' }]

  const candidates = [{ name: 'foo', description: 'foo description' }]

  const mapper = new ExampleMapper()

  expect(
    differ.diff({ existing, candidates, mapper })
  ).toEqual({
    noop: [{
      entity: existing[0],
    }],
    modify: [],
    create: [],
    delete: [],
  })
})

test('set as modify when isEqual result is true and mapping does not match', () => {
  const differ = new Differ<MoreComplex, MoreComplexMapper>()

  const existing = [{
    id: 1,
    name: 'foo',
    description: 'Foo description',
    somethingElse: 5,
  }]

  const candidates = [{
      name: 'foo',
      description: 'Foo description',
      somethingElse: 10,
  }]

  const mapper = new MoreComplexMapper()

  expect(
    differ.diff({ existing, candidates, mapper })
  ).toEqual({
    noop: [],
    modify: [{
      entity: existing[0],
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
  const differ = new Differ<MoreComplex, MoreComplexMapper>()

  const existing = [{ id: 1, name: 'foo', description: undefined }]

  const candidates = [{ name: 'foo', description: null }]

  const mapper = new MoreComplexMapper()

  expect(
    differ.diff({ existing, candidates, mapper })
  ).toEqual({
    noop: [{
      entity: existing[0],
    }],
    modify: [],
    create: [],
    delete: [],
  })
})
