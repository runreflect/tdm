import { Mapper, Property } from '../src/mapper'
import { Executor } from '../src/executor'
import { Fixture, Relations } from '../src/fixture'
import { TDM, RunError } from '../src/tdm'
import { Printer } from '../src/printer'

interface Simple {
  id: number,
  name: string,
  description?: string,
}

interface Other {
  id: number,
  name: string,
  simpleId: number,
}

class SimpleMapper extends Mapper<Simple> {
  fields = {
    id: Property.Identifier,
    name: Property.Comparator,
    description: Property.Field,
  } as const
}

class OtherMapper extends Mapper<Other> {
  fields = {
    id: Property.Identifier,
    name: Property.Comparator,
    simpleId: {
      mapper: new SimpleMapper(),
      field: 'id',
    }
  } as const
}

const EXISTING_ENTITIES: Simple[] = [ // 3 entities exist in DB
  { id: 1, name: 'Foo', description: 'Foo description' },
  { id: 2, name: 'Bar', description: 'Different description' },
  { id: 3, name: 'Baz' },
]

class SimpleExecutor extends Executor<Simple> {
  async create(obj: Simple) {
    // NO-OP
  }
  
  async readAll(): Promise<Simple[]> {
    return EXISTING_ENTITIES
  }
  
  async update(obj: Simple) {
    // NO-OP
  }
  
  async delete(objOrId: Simple | string) {
    // NO-OP
  }
}

class OtherExecutor extends Executor<Other> {
  async create(obj: Other) {
    // NO-OP
  }
  
  async readAll(): Promise<Other[]> {
    return []
  }
  
  async update(obj: Other) {
    // NO-OP
  }
  
  async delete(objOrId: Other | string) {
    // NO-OP
  }
}

beforeEach(() => {
  jest.spyOn(Printer, 'print').mockImplementation(() => {})
  jest.spyOn(Printer, 'printDiff').mockImplementation(() => {})
})

test('correct results are returned', async () => {
  const tdm = new TDM()

  const fixtures: Fixture<SimpleMapper, Simple>[] = [
    { name: 'Foo', description: 'Foo description', [Relations]: {} },
    { name: 'Bar', description: 'Bar description', [Relations]: {} },
    { name: 'New', description: undefined, [Relations]: {} },
  ]

  tdm.add(fixtures, new SimpleMapper(), new SimpleExecutor())

  const results = await tdm.run({ dryRun: true })

  expect(results).toEqual({
    SimpleMapper: {
      create: [{
        entityToCreate: { name: 'New', description: undefined },
      }],
      modify: [{
        entity: { id: 2, name: 'Bar', description: 'Different description'},
        updatedEntity: { id: 2, name: 'Bar', description: 'Bar description' },
      }],
      noop: [{
        entity: { id: 1, name: 'Foo', description: 'Foo description' },
      }],
      delete: [
        { entity: { id: 3, name: 'Baz' } },
      ],
    },
  })
})

test('should handle relations', async () => {
  const tdm = new TDM()
  
  const simpleFixtures: Fixture<SimpleMapper, Simple>[] = [
    { name: 'Foo', description: 'Foo description', [Relations]: {} },
    { name: 'Bar', description: 'Bar description', [Relations]: {} },
    { name: 'New', description: undefined, [Relations]: {} },
  ]

  const otherFixtures: Fixture<OtherMapper, Other>[] = [
    {
      name: 'Something New',
      [Relations]: {
        simpleId: { name: 'Foo' },
      }
    },
  ]

  tdm.add(simpleFixtures, new SimpleMapper(), new SimpleExecutor())
  tdm.add(otherFixtures, new OtherMapper(), new OtherExecutor())

  const results = await tdm.run({ dryRun: true })

  expect(results).toEqual({
    OtherMapper: {
      create: [{
        entityToCreate: { name: 'Something New', simpleId: 1 },
      }],
      modify: [],
      noop: [],
      delete: [],
    },
    SimpleMapper: {
      create: [{
        entityToCreate: { name: 'New', description: undefined },
      }],
      modify: [{
        entity: { id: 2, name: 'Bar', description: 'Different description'},
        updatedEntity: { id: 2, name: 'Bar', description: 'Bar description' },
      }],
      noop: [{
        entity: { id: 1, name: 'Foo', description: 'Foo description' },
      }],
      delete: [
        { entity: { id: 3, name: 'Baz' } },
      ],
    }
  })
})

test('should populate error property if relation cannot be resolved', async () => {
  const tdm = new TDM()
  
  const otherFixtures: Fixture<OtherMapper, Other>[] = [
    {
      name: 'Something New',
      [Relations]: {
        simpleId: {
          name: 'Foo',
        },
      }
    },
  ]

  // Note that 'SimpleMapper' is not included
  tdm.add(otherFixtures, new OtherMapper(), new OtherExecutor())

  const results = await tdm.run({ dryRun: true })

  expect(results).toEqual({
    OtherMapper: {
      create: [{
        entityToCreate: { name: 'Something New', simpleId: { [RunError]: 'Relation not found' } },
      }],
      modify: [],
      noop: [],
      delete: [],
    },
  })
})
