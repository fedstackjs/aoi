import { Document } from 'mongodb'

export function searchToFilter(query: { search?: string; tag?: string }): Document | null {
  if (Object.keys(query).length > 1) return null
  const filter: Document = {}
  if (query.search) {
    const escapedRegex = query.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
    // Should satisfy: title match Regex or slug match Regex
    filter.$or = [{ title: { $regex: escapedRegex } }, { slug: { $regex: escapedRegex } }]
  }
  if (query.tag) {
    filter.tags = query.tag
  }
  return filter
}

export function filterMerge(base: Document, extra: Document): Document {
  const result: Document = {}
  if (base.orgId) result.orgId = base.orgId
  if (extra.tags) result.tags = extra.tags
  if (extra.$or) {
    result.$and = [{ $or: extra.$or }, { $or: base.$or }]
  } else {
    result.$or = base.$or
  }
  return result
}
