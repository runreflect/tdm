import { TDM } from '../src/tdm'
import { Fixture, FixtureTransformer, FixtureExecutor, FixturePrimaryKeyMapper } from '../src/fixture'

// This can be auto-generated for both database tables and APIs
interface Product extends Fixture {
  id: number,
  name: string,
  description?: string,
  isAvailable: boolean,
}

// This can be auto-generated for database tables (e.g. this is the primary key)
class ProductPrimaryKeyMapper implements FixturePrimaryKeyMapper<Product> {
  isEqual(obj1: Product, obj2: Product): boolean { return obj1.id === obj2.id }
}

// This can be auto-generated for database tables (e.g. this hooks into the ORM). For APIs, the API endpoints will be
// callable but mapping those calls to these methods is not auto-generated.
class ProductExecutor implements FixtureExecutor<Product> {
  create(obj: Product) {}
  read(obj: Product) {} //TODO need a 'read collection' too so we can iterate over set of existing records...
  update(obj: Product) {}
  delete(obj: Product) {}
}

class ProductTransformer implements FixtureTransformer<Product> {
  fixtures: Product[]
  mapper: ProductPrimaryKeyMapper
  executor: ProductExecutor

  constructor(fixtures: Product[], mapper: ProductPrimaryKeyMapper, executor: ProductExecutor) {
    this.fixtures = fixtures
    this.mapper = mapper
    this.executor = executor
  }
}

const fixtures: Product[] = [
  {
    id: 1,
    name: 'Product 1',
    isAvailable: true,
  },
  {
    id: 2,
    name: 'Product 2',
    description: 'This has a description',
    isAvailable: false,
  },
]

test('end to end', () => {
  const tdm = new TDM()
  tdm.run(new ProductTransformer(fixtures, new ProductPrimaryKeyMapper(), new ProductExecutor())) //TODO actually compare with response

  expect(1).toEqual(1) //TODO assert actual results
})
