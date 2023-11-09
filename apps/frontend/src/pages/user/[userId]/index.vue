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
import { withTitle } from '@/utils/title'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useAsyncState } from '@vueuse/core'
import { http } from '@/utils/http'
import { useAppState } from '@/stores/app'
import AsyncState from '@/components/utils/AsyncState.vue'
import UserInfoBoard from '@/components/user/UserInfoBoard.vue'
import type { userInfoProfile } from '@/components/user/types'

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
