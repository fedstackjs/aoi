import { Type, ExtendedTypeBuilder, TSchema, ObjectOptions, TProperties } from '@sinclair/typebox'
import { BSON } from 'mongodb'
import './formats.js'

export enum AccessLevel {
  PUBLIC = 0,
  RESTRICED = 1,
  PRIVATE = 2
}

declare module '@sinclair/typebox' {
  interface ExtendedTypeBuilder {
    UUID(): TUnsafe<BSON.UUID | string>
    Hash(): TString
    AccessLevel(): TUnsafe<AccessLevel>
    StringEnum<T extends string[]>(values: [...T]): TUnsafe<T[number]>
    IntegerEnum<T extends Record<string, string | number>>(obj: T): TUnsafe<T[keyof T]>
    NoAdditionalProperties<S extends TSchema>(schema: S): S
    StrictObject<T extends TProperties>(properties: T, options?: ObjectOptions): TObject<T>
  }
}

ExtendedTypeBuilder.prototype.UUID = function () {
  return Type.Unsafe<BSON.UUID | string>(Type.String({ format: 'uuid' }))
}

ExtendedTypeBuilder.prototype.Hash = function () {
  return Type.String({ pattern: '^[0-9a-f]{64}$' })
}

ExtendedTypeBuilder.prototype.StringEnum = function <T extends string[]>(values: [...T]) {
  return Type.Unsafe<T[number]>({ type: 'string', enum: values })
}

ExtendedTypeBuilder.prototype.IntegerEnum = function <T extends Record<string, string | number>>(
  obj: T
) {
  const values = Object.getOwnPropertyNames(obj)
    .filter((key) => isNaN(key as unknown as number))
    .map((key) => obj[key]) as T[keyof T][]
  return Type.Unsafe<T[keyof T]>(Type.Integer({ enum: values }))
}

ExtendedTypeBuilder.prototype.AccessLevel = function () {
  return this.IntegerEnum(AccessLevel)
}

ExtendedTypeBuilder.prototype.NoAdditionalProperties = function <S extends TSchema>(schema: S) {
  return {
    ...schema,
    additionalProperties: false
  }
}

ExtendedTypeBuilder.prototype.StrictObject = function <T extends TProperties>(
  properties: T,
  options?: ObjectOptions
) {
  return Type.Object(properties, { ...options, additionalProperties: false })
}

export const SBaseProfile = Type.Object({
  name: Type.String(),
  email: Type.String()
})
