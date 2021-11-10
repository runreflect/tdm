import startCase from 'lodash/startCase'

const REF_PREFIX = '#/components/schemas/'

export function toTitleCase(str: string): string {
  return startCase(str).replace(/\s/g, '')
}

export function schemaFromRef(ref: string): string | undefined {
  if (ref && ref.startsWith(REF_PREFIX)) {
    return ref.substring(REF_PREFIX.length)
  }
}
