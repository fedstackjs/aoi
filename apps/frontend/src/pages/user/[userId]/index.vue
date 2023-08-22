<template>
  <AsyncState :state="profile">
    <template v-slot="{ value }">
      <VRow>
        <VCol>
          <UserInfoBoard :profile="value" :user-id="props.userId" :show-settings="true" />
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
import AsyncState from '@/components/utils/AsyncState.vue'
import UserInfoBoard from '@/components/user/UserInfoBoard.vue'

const { t } = useI18n()
const props = defineProps<{
  userId: string
}>()

withTitle(computed(() => t('user-info')))

const profile = useAsyncState(async () => {
  const resp = await http.get(`user/${props.userId}/profile`)
  return await resp.json<{
    name: string
    email: string
    realname: string
  }>()
}, null as never)
</script>
