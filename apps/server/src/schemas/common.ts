import { JavaScriptTypeBuilder, TSchema, ObjectOptions, TProperties } from '@sinclair/typebox'
import { BSON } from 'mongodb'
import './formats.js'

export { Static } from '@sinclair/typebox'

export enum AccessLevel {
  PUBLIC = 0,
  RESTRICED = 1,
  PRIVATE = 2
}

export class ServerTypeBuilder extends JavaScriptTypeBuilder {
  UUID() {
    return this.Unsafe<BSON.UUID | string>(this.String({ format: 'uuid' }))
  }

  Hash() {
    return this.String({ pattern: '^[0-9a-f]{64}$' })
  }

  StringEnum<T extends string[]>(values: [...T]) {
    return this.Unsafe<T[number]>({ type: 'string', enum: values })
  }

  IntegerEnum<T extends Record<string, string | number>>(obj: T) {
    const values = Object.getOwnPropertyNames(obj)
      .filter((key) => isNaN(key as unknown as number))
      .map((key) => obj[key]) as T[keyof T][]
    return this.Unsafe<T[keyof T]>(this.Integer({ enum: values }))
  }

  AccessLevel() {
    return this.IntegerEnum(AccessLevel)
  }

  NoAdditionalProperties<S extends TSchema>(schema: S) {
    return {
      ...schema,
      additionalProperties: false
    }
  }

  StrictObject<T extends TProperties>(properties: T, options?: ObjectOptions) {
    return this.Object(properties, { ...options, additionalProperties: false })
  }

  PaginationResult<T extends TSchema>(itemType: T) {
    return this.Object({
      items: this.Array(itemType),
      total: this.Optional(this.Integer())
    })
  }
}

export const T = new ServerTypeBuilder()

export const SBaseProfile = T.StrictObject({
  name: T.String(),
  email: T.String()
})
