import { Document } from 'mongodb'

export function searchToFilter(query: { search?: string; tag?: string }): Document | null {
  if (Object.keys(query).length > 1) return null
  const filter: Document = {}
  if (query.search) {
    const escapedRegex = query.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
    filter.title = { $regex: escapedRegex }
  }
  if (query.tag) {
    filter.tags = query.tag
  }
  return filter
}
