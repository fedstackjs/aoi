import { ObjectOptions, TProperties, Type } from '@sinclair/typebox'

export function StrictObject<T extends TProperties>(properties: T, options: ObjectOptions = {}) {
  return Type.Object(properties, { additionalProperties: false, ...options })
}
