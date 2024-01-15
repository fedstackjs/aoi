import { get, set } from 'idb-keyval'
import debug from 'debug'
import { AsyncQueue, BatchingQueue } from './async'
import { http } from './http'

const log = debug('util:profile')

export interface IPublicProfile {
  principalId: string
  principalType: string
  name: string
  emailHash: string
}

export interface IProfileCacheEntry {
  profile: IPublicProfile
  updatedAt: number
}

const cacheTTL = 3600 * 1000 // 1 hour
const fetchQueue = new AsyncQueue()

export async function fetchPrincipalsProfiles(principalIds: string[]) {
  const profiles = await fetchQueue.enqueue(async () =>
    http
      .post('public/fetch-principals-profiles', {
        json: {
          principalIds
        }
      })
      .json<IPublicProfile[]>()
  )
  const now = Date.now()
  await Promise.all(
    profiles.map((profile: IProfileCacheEntry['profile']) =>
      set(`profile:${profile.principalId}`, { profile, updatedAt: now })
    )
  )
  const profilesMap = Object.fromEntries(profiles.map((profile) => [profile.principalId, profile]))
  return principalIds.map((id) => profilesMap[id])
}

const getQueue = new BatchingQueue(fetchPrincipalsProfiles)

export async function getProfile(principalId: string) {
  const result: IProfileCacheEntry | undefined = await get(`profile:${principalId}`)
  if (result && result.updatedAt > Date.now() - cacheTTL) return result.profile
  log(`Principal ${principalId} profile cache miss`)
  const profile = await getQueue.enqueue(principalId)
  return profile
}

export async function invalidateProfile(principalId: string) {
  await set(`profile:${principalId}`, undefined)
  log(`Principal ${principalId} profile cache invalidated`)
}
