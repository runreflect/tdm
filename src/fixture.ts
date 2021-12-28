import { Mapper, Property, Relation } from './mapper'
import { PickByValue } from 'utility-types'

export const Relations: unique symbol = Symbol('Relations')

type Fields<T extends Mapper<T1> extends keyof T1 ? any : any, T1> = {
  [K in keyof (PickByValue<T['fields'], Property.Comparator | Property.Field>)]: T1[K]
}

type Relations<T extends Mapper<T1> extends keyof T1 ? any : any, T1> = {
  [Relations]: {
    [K in keyof (PickByValue<T['fields'], Relation<any>>)]: unknown; //TODO can improve value type here
  }
}

export type Fixture<T extends Mapper<T1> extends keyof T1 ? any : any, T1> = Fields<T, T1> & Relations<T, T1>
