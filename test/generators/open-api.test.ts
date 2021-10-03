import { OpenAPIGenerator } from '../../src/generators/open-api'

test('parses simple types', async () => {
  const generator = new OpenAPIGenerator()
  const result = await generator.parse('test/resources/openapi/simple-types.yaml')
  const expectedOutput = `import { Fixture } from 'tdm/fixture'

export interface Foo extends Fixture {
    a?: string;
    b?: number;
    c?: number;
    d?: boolean;
}
`
  expect(result).toEqual([{
    filename: 'Foo.ts',
    source: expectedOutput
  }])
})

test('parse array types', async () => {
  const generator = new OpenAPIGenerator()
  const result = await generator.parse('test/resources/openapi/arrays.yaml')

  const bar = `import { Fixture } from 'tdm/fixture'

export interface Bar extends Fixture {
    a?: string;
}
`

  const foo = `import { Fixture } from 'tdm/fixture'
import { Bar } from './Bar'

export interface Foo extends Fixture {
    a?: string[];
    b?: number[];
    c?: number[];
    d?: boolean[];
    e?: Bar[];
}
`

  expect(result).toEqual([
    {
      filename: 'Bar.ts',
      source: bar,
    },
    {
      filename: 'Foo.ts',
      source: foo,
    },
  ])
})

test('parse anyOf type', async () => {
  const generator = new OpenAPIGenerator()
  const result = await generator.parse('test/resources/openapi/any-of.yaml')
  const bar = `import { Fixture } from 'tdm/fixture'

export interface Bar extends Fixture {
    b?: number;
}
`
  const foo = `import { Fixture } from 'tdm/fixture'

export interface Foo extends Fixture {
    a?: string;
}
`

  const union = `import { Fixture } from 'tdm/fixture'
import { Foo } from './Foo'
import { Bar } from './Bar'

export interface Union extends Fixture {
    c?: Foo | Bar;
}
`

  expect(result).toEqual([
    {
      filename: 'Bar.ts',
      source: bar,
    },
    {
      filename: 'Foo.ts',
      source: foo,
    },
    {
      filename: 'Union.ts',
      source: union,
    },
  ])
})

// 'oneOf' requires that exactly one subschema matches, where 'anyOf' allows for one or more subschemas to match.
// We treat 'oneOf' and 'anyOf' the same and convert them to a union type.
// See https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/ for more information
test('parse oneOf type', async () => {
  const generator = new OpenAPIGenerator()
  const result = await generator.parse('test/resources/openapi/one-of.yaml')
  const bar = `import { Fixture } from 'tdm/fixture'

export interface Bar extends Fixture {
    b?: number;
}
`
  const foo = `import { Fixture } from 'tdm/fixture'

export interface Foo extends Fixture {
    a?: string;
}
`

  const union = `import { Fixture } from 'tdm/fixture'
import { Foo } from './Foo'
import { Bar } from './Bar'

export interface Union extends Fixture {
    c?: Foo | Bar;
}
`

  expect(result).toEqual([
    {
      filename: 'Bar.ts',
      source: bar,
    },
    {
      filename: 'Foo.ts',
      source: foo,
    },
    {
      filename: 'Union.ts',
      source: union,
    },
  ])
})

test('parse allOf type', async () => {
  const generator = new OpenAPIGenerator()
  const result = await generator.parse('test/resources/openapi/all-of.yaml')
  const bar = `import { Fixture } from 'tdm/fixture'

export interface Bar extends Fixture {
    b?: number;
}
`
  const foo = `import { Fixture } from 'tdm/fixture'

export interface Foo extends Fixture {
    a?: string;
}
`

  const union = `import { Fixture } from 'tdm/fixture'
import { Foo } from './Foo'
import { Bar } from './Bar'

export interface Union extends Fixture {
    c?: Foo & Bar;
}
`
  const baz = `import { Fixture } from 'tdm/fixture'
import { PaginationOptions } from './PaginationOptions'
import { Bar } from './Bar'

export type Baz = PaginationOptions & { 'data': Bar[] };
`

  const paginationOptions = `import { Fixture } from 'tdm/fixture'

export interface PaginationOptions extends Fixture {
    cursor?: string;
}
`

  expect(result).toEqual([
    {
      filename: 'Bar.ts',
      source: bar,
    },
    {
      filename: 'Baz.ts',
      source: baz,
    },
    {
      filename: 'Foo.ts',
      source: foo,
    },
    {
      filename: 'PaginationOptions.ts',
      source: paginationOptions,
    },
    {
      filename: 'Union.ts',
      source: union,
    },
  ])
})

test('parses optional vs required fields', async () => {
  const generator = new OpenAPIGenerator()
  const result = await generator.parse('test/resources/openapi/required.yaml')

  const foo = `import { Fixture } from 'tdm/fixture'

export interface Foo extends Fixture {
    a: string;
    b?: number;
}
`

  expect(result).toEqual([{
    filename: 'Foo.ts',
    source: foo,
  }])
})

test('parses enums', async () => {
  const generator = new OpenAPIGenerator()
  const result = await generator.parse('test/resources/openapi/enums.yaml')

  const foo = `import { Fixture } from 'tdm/fixture'

export interface Foo extends Fixture {
    a?: 'black' | 'white' | 'red' | 'green' | 'blue';
}
`

  expect(result).toEqual([{
    filename: 'Foo.ts',
    source: foo,
  }])
})

test('parse self-referential schemas', async () => {
  const generator = new OpenAPIGenerator()
  const result = await generator.parse('test/resources/openapi/self-refential.yaml')

  const foo = `import { Fixture } from 'tdm/fixture'

export interface Foo extends Fixture {
    a?: string;
    b?: Foo;
}
`

  expect(result).toEqual([{
    filename: 'Foo.ts',
    source: foo,
  }])
})

test('parse object type without $ref', async () => {
  const generator = new OpenAPIGenerator()
  const result = await generator.parse('test/resources/openapi/object.yaml')

  const foo = `import { Fixture } from 'tdm/fixture'

export interface Foo extends Fixture {
    complex?: { 'a': string, 'b': number, 'c': number, 'd': boolean };
}
`

  expect(result).toEqual([{
    filename: 'Foo.ts',
    source: foo,
  }])
})
