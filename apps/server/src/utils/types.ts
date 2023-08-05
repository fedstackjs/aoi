import { ObjectOptions, TProperties, Type } from '@sinclair/typebox'
import { BSON } from 'mongodb'
import { AccessLevel } from '../db/common.js'

export function StrictObject<T extends TProperties>(properties: T, options: ObjectOptions = {}) {
  return Type.Object(properties, { additionalProperties: false, ...options })
}

export function TypeUUID() {
  return Type.Unsafe<BSON.UUID>(Type.String())
}

export function TypeLong() {
  return Type.Unsafe<BSON.Long>(Type.String())
}

export function TypeAccessLevel() {
  return Type.Unsafe<AccessLevel>(Type.Integer({ enum: Object.values(AccessLevel) }))
}

export function StringEnum<T extends string[]>(values: [...T]) {
  return Type.Unsafe<T[number]>({ type: 'string', enum: values })
}
