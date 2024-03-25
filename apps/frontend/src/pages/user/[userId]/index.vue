<template>
  <AsyncState :state="profile" hide-when-loading>
    <template v-slot="{ value }">
      <VRow>
        <VCol>
          <UserInfoBoard :profile="value" :user-id="props.userId" :authed="authed" />
        </VCol>
      </VRow>
    </template>
  </AsyncState>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { userInfoProfile } from '@/components/user/types'
import UserInfoBoard from '@/components/user/UserInfoBoard.vue'
import AsyncState from '@/components/utils/AsyncState.vue'
import { useAppState } from '@/stores/app'
import { http } from '@/utils/http'
import { withTitle } from '@/utils/title'

const { t } = useI18n()
const appState = useAppState()
const props = defineProps<{
  userId: string
}>()

const authed = computed(() => appState.userCapability == -1 || appState.userId === props.userId)

withTitle(computed(() => t('pages.user-info')))

const profile = useAsyncState(async () => {
  const resp = await http.get(`user/${props.userId}/profile`)
  return await resp.json<userInfoProfile>()
}, null as never)
</script>
