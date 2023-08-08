import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAsyncState, useTitle, watchDebounced } from '@vueuse/core'
import { http, isLoggedIn, userId } from '@/utils/http'
import { useRoute } from 'vue-router'
import type { IOrgProfile } from '@/types'

export const useAppState = defineStore('app_state', () => {
  const route = useRoute()
  const orgId = computed(() => '' + (route.params.orgId ?? ''))
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
  return {
    navBar,
    title,
    loggedIn,
    userId,
    orgId,
    orgProfile: computed(() => orgProfile)
  }
})
