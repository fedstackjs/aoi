import { ObjectOptions, TProperties, Type } from '@sinclair/typebox'
import { BSON } from 'mongodb'

export function StrictObject<T extends TProperties>(properties: T, options: ObjectOptions = {}) {
  return Type.Object(properties, { additionalProperties: false, ...options })
}

export function TypeUUID() {
  return Type.Unsafe<BSON.UUID>(Type.String())
}
