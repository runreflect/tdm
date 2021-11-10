import { Differ } from "../src/differ"

interface ExampleEntity {
  foo: string,
}

interface ExampleFixture {
  nested: {
    foo: string,
  }
}

test('no match on primary entity', () => {
  const differ = new Differ<ExampleEntity, ExampleFixture>()

  const existing = { foo: 'bar' }
  const expected = {
    nested: { foo: 'baz' }
  }

  function isEqual(obj1: ExampleEntity, obj2: ExampleFixture) {
    return obj1.foo === obj2.nested.foo
  }

  expect(
    differ.diff([existing], [expected], isEqual)
  ).toEqual({
    noop: [],
    modify: [],
    create: [{
      fixture: expected,
    }],
    delete: [{
      model: existing,
    }],
  })
})

test('matching on primary entity', () => {
  const differ = new Differ<ExampleEntity, ExampleFixture>()

  const existing = { foo: 'bar' }
  const expected = {
    nested: { foo: 'bar' }
  }

  function isEqual(obj1: ExampleEntity, obj2: ExampleFixture) {
    return obj1.foo === obj2.nested.foo
  }

  expect(
    differ.diff([existing], [expected], isEqual)
  ).toEqual({
    noop: [{
      fixture: expected,
      model: existing,
    }],
    modify: [],
    create: [],
    delete: [],
  })
})
