import { TProperties, ObjectOptions, Type } from '@sinclair/typebox'
import { BSON } from 'mongodb'
import './formats.js'

export function StrictObject<T extends TProperties>(properties: T, options: ObjectOptions = {}) {
  return Type.Object(properties, { additionalProperties: false, ...options })
}

export function TypeUUID() {
  return Type.Unsafe<BSON.UUID>(Type.String())
}

export function TypeLong() {
  return Type.Unsafe<BSON.Long>(Type.String())
}

export function StringEnum<T extends string[]>(values: [...T]) {
  return Type.Unsafe<T[number]>({ type: 'string', enum: values })
}

export enum AccessLevel {
  PUBLIC = 0,
  RESTRICED = 1,
  PRIVATE = 2
}

export function TypeIntegerEnum<T extends Record<string, string | number>>(obj: T) {
  const values = Object.getOwnPropertyNames(obj)
    .filter((key) => isNaN(key as unknown as number))
    .map((key) => obj[key]) as T[keyof T][]
  return Type.Unsafe<T[keyof T]>(Type.Integer({ enum: values }))
}

export function TypeAccessLevel() {
  return TypeIntegerEnum(AccessLevel)
}
