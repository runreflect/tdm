import { Differ } from "../src/differ"

interface Example {
  foo: string,
}

test('no match', () => {
  const differ = new Differ<Example>()

  const existing = [{ foo: 'bar' }]
  const expected = [{ foo: 'baz' }]

  expect(
    differ.diff(existing, expected)
  ).toEqual({
    noop: [],
    modify: [],
    create: expected,
    delete: existing,
  })
})

test('match', () => {
  const differ = new Differ<Example>()

  const existing = [{ foo: 'bar' }]
  const expected = [{ foo: 'bar' }] // Use separate variable to test that it isn't comparing based on object reference

  expect(
    differ.diff(existing, expected)
  ).toEqual({
    noop: existing,
    modify: [],
    create: [],
    delete: [],
  })
})
