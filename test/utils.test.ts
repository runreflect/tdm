import { toTitleCase, schemaFromRef } from "../src/utils"

test('toTitleCase replaces snake case with title case', () => {
  expect(toTitleCase('foo_bar_baz')).toEqual('FooBarBaz')
})

test('toTitleCase retains already capitalized letters', () => {
  expect(toTitleCase('FooBarBaz')).toEqual('FooBarBaz')
})

test('toTitleCase to handle hyphens', () => {
  expect(toTitleCase('foo-bar-baz')).toEqual('FooBarBaz')
})

test('schemaFromRef returns name of Schema', () => {
  expect(schemaFromRef('#/components/schemas/Foo')).toEqual('Foo')
})

test('schemaFromRef return undefined if Schema name is malformed', () => {
  expect(schemaFromRef('foobarbaz')).toEqual(undefined)
})
