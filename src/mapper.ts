export enum Property {
  Identifier,
  Comparator,
  Field,
  Ignored
}

export abstract class Mapper<T> {
  abstract fields: Record<keyof T, Property | Relation<any>>
}

export interface Relation<T> {
  mapper: Mapper<T>,
  field: keyof T
}
