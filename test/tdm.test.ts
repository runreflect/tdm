import { Executor } from '../src/executor'
import { Fixture, FixtureTransformer, IFixture } from '../src/fixture'
import { TDM } from '../src/tdm'

interface SimpleFixture {
  name: string,
  description?: string,
  [Fixture.References]?: {},
}

interface SimpleEntity {
  id: number,
  name: string,
  description?: string,
}

class FakeTransformer extends FixtureTransformer<SimpleFixture, SimpleEntity, 'id'> {
  constructor(fixtures: SimpleFixture[]) {
    super(fixtures)
  }

  isMatchesEntity(entity: SimpleEntity, fixture: SimpleFixture): boolean {
    return entity.name === fixture.name
  }

  mapping(fixture: SimpleFixture): Omit<SimpleEntity, 'id'> {
    return {
      name: fixture.name,
      description: fixture.description,
    }
  }

  primaryKey(): 'id' {
    return 'id'
  }
}

const EXISTING_ENTITIES: SimpleEntity[] = [ // 3 entities exist in DB
  { id: 1, name: 'Foo', description: 'Foo description' },
  { id: 2, name: 'Bar', description: 'Different description' },
  { id: 3, name: 'Baz' },
]

class FakeExecutor extends Executor<SimpleEntity> {
  async create(obj: SimpleEntity) {
    // NO-OP
  }
  
  async readCollection(): Promise<SimpleEntity[]> {
    return EXISTING_ENTITIES
  }
  
  async read(objOrId: SimpleEntity | string) {
    const id = isSimpleEntity(objOrId) ? objOrId.id : objOrId

    return EXISTING_ENTITIES.find(entity => entity.id === id)
  }
  
  async update(obj: SimpleEntity) {
    // NO-OP
  }
  
  async delete(objOrId: SimpleEntity | string) {
    // NO-OP
  }
}

function isSimpleEntity(objOrId: SimpleEntity | string): objOrId is SimpleEntity {
  return (objOrId as SimpleEntity).id != undefined
}


test('correct results are returned', async () => {
  const tdm = new TDM()

  const fixtures: SimpleFixture[] = [
    { name: 'Foo', description: 'Foo description' },
    { name: 'Bar', description: 'Bar description' },
    { name: 'New' }
  ]

  tdm.add('example', new FakeTransformer(fixtures), new FakeExecutor())

  const results = await tdm.run({ dryRun: true })

  expect(results).toEqual({
    example: {
      create: [{
        fixture: { name: 'New' },
        entityToCreate: { name: 'New', description: undefined },
      }],
      modify: [{
        fixture: { name: 'Bar', description: 'Bar description' },
        entity: { id: 2, name: 'Bar', description: 'Different description'},
        updatedEntity: { id: 2, name: 'Bar', description: 'Bar description' },
      }],
      noop: [{
        fixture: { name: 'Foo', description: 'Foo description' },
        entity: { id: 1, name: 'Foo', description: 'Foo description' },
      }],
      delete: [
        { entity: { id: 3, name: 'Baz' } },
      ],
    },
  })
})
