import { Document } from 'mongodb'

export function escapeSearch(search: string) {
  return search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

export function searchToFilter(
  query: {
    search?: string
    tag?: string
    tags?: string[]
  },
  { maxConditions } = { maxConditions: 1 }
): Document | null {
  if (Object.keys(query).length > maxConditions) return null
  const filter: Document = {}
  if (query.search) {
    const escapedRegex = escapeSearch(query.search)
    // Should satisfy: title match Regex or slug match Regex
    filter.$or = [{ title: { $regex: escapedRegex } }, { slug: { $regex: escapedRegex } }]
  }
  if (query.tag) {
    filter.tags = query.tag
  }
  if (query.tags) {
    filter.tags = { $all: query.tags }
  }
  return filter
}

export function filterMerge(base: Document, extra: Document): Document {
  return { $and: [base, extra] }
}
