import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useAsyncState, useLocalStorage, useTitle, watchDebounced } from '@vueuse/core'
import { http, isLoggedIn, userId } from '@/utils/http'
import { useRoute } from 'vue-router'
import type { IOrgProfile, IUserProfile } from '@/types'

export const useAppState = defineStore('app_state', () => {
  const route = useRoute()

  const user = useAsyncState(async () => {
    const resp = await http.get(`user/${userId.value}`)
    const user = await resp.json<{
      profile: IUserProfile
      capability: string
    }>()
    return user
  }, null)
  watchDebounced(userId, () => user.execute(), { immediate: true })

  const orgId = ref((route.params.orgId as string) ?? '')
  watch(
    () => route.params.orgId,
    (val) => val && (orgId.value = val as string)
  )
  const orgProfile = useAsyncState(
    async () => {
      if (!orgId.value) return null
      const resp = await http.get(`org/${orgId.value}`)
      return resp.json<{ profile: IOrgProfile; membership: { capability: string } }>()
    },
    null,
    { immediate: false }
  )
  watchDebounced(orgId, () => orgProfile.execute(), { immediate: true })

  const navBar = ref<boolean>()
  const title = useTitle()
  const loggedIn = isLoggedIn

  const debug = useLocalStorage('aoi-GENSHIN-START!', false, { writeDefaults: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overrides = useLocalStorage('aoi-GENSHIN-OVERRIDES', {} as Record<string, any>, {
    writeDefaults: false
  })
  const withOverride = <T>(key: string, fn: () => T) => computed(() => overrides.value[key] ?? fn())
  return {
    navBar,
    title,
    loggedIn,
    userId,
    user: computed(() => user),
    userCapability: withOverride('userCapability', () => user.state.value?.capability ?? '0'),
    orgId,
    orgProfile: computed(() => orgProfile),
    orgCapability: withOverride(
      'orgCapability',
      () => orgProfile.state.value?.membership?.capability ?? '0'
    ),
    debug,
    overrides
  }
})
