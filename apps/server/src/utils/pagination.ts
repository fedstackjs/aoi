import { Collection, Document, Filter, FindOptions, Sort, WithId } from 'mongodb'

export function paginationSkip(page: number, perPage: number) {
  return (page - 1) * perPage
}

export async function findPaginated<T extends Document>(
  collection: Collection<T>,
  page: number,
  perPage: number,
  count: boolean,
  filter: Filter<T>,
  options?: FindOptions,
  sort?: Sort
): Promise<{
  items: WithId<T>[]
  total?: number
}> {
  const skip = paginationSkip(page, perPage)
  let cursor = collection.find(filter, options)
  if (sort) cursor = cursor.sort(sort)
  cursor = cursor.skip(skip).limit(perPage)
  const items = await cursor.toArray()
  const total = count ? await collection.countDocuments(filter, options) : undefined
  return { items, total }
}
