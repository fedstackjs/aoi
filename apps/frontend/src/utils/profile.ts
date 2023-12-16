import { get, set } from 'idb-keyval'
import debug from 'debug'
import { AsyncQueue, BatchingQueue } from './async'
import { http } from './http'

const log = debug('util:profile')

export interface IPublicProfile {
  principleId: string
  name: string
  emailHash: string
}

export interface IProfileCacheEntry {
  profile: IPublicProfile
  updatedAt: number
}

const cacheTTL = 3600 * 1000 // 1 hour
const fetchQueue = new AsyncQueue()

export async function fetchPrinciplesProfiles(principleIds: string[]) {
  const profiles = await fetchQueue.enqueue(async () =>
    http
      .post('public/fetch-principles-profiles', {
        json: {
          principleIds
        }
      })
      .json<IPublicProfile[]>()
  )
  const now = Date.now()
  await Promise.all(
    profiles.map((profile: IProfileCacheEntry['profile']) =>
      set(`profile:${profile.principleId}`, { profile, updatedAt: now })
    )
  )
  const profilesMap = Object.fromEntries(profiles.map((profile) => [profile.principleId, profile]))
  return principleIds.map((id) => profilesMap[id])
}

const getQueue = new BatchingQueue(fetchPrinciplesProfiles)

export async function getProfile(principleId: string) {
  const result: IProfileCacheEntry | undefined = await get(`profile:${principleId}`)
  if (result && result.updatedAt > Date.now() - cacheTTL) return result.profile
  log(`Principle ${principleId} profile cache miss`)
  const profile = await getQueue.enqueue(principleId)
  return profile
}

export async function invalidateProfile(principleId: string) {
  await set(`profile:${principleId}`, undefined)
  log(`Principle ${principleId} profile cache invalidated`)
}
