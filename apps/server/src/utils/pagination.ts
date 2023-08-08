import { TSchema, Type } from '@sinclair/typebox'
import { Collection, Document, Filter, FindOptions, WithId } from 'mongodb'

export function TypePaginationResult<T extends TSchema>(itemType: T) {
  return Type.Object({
    items: Type.Array(itemType),
    total: Type.Optional(Type.Integer())
  })
}

export function paginationSkip(page: number, perPage: number) {
  return (page - 1) * perPage
}

export async function findPaginated<T extends Document>(
  collection: Collection<T>,
  page: number,
  perPage: number,
  count: boolean,
  filter: Filter<T>,
  options?: FindOptions
): Promise<{
  items: WithId<T>[]
  total?: number
}> {
  const skip = paginationSkip(page, perPage)
  const items = await collection.find(filter, options).skip(skip).limit(perPage).toArray()
  const total = count ? await collection.countDocuments(filter) : undefined
  return { items, total }
}
