<template>
  <VBtn
    color="blue"
    :loading="participant.isLoading.value || register.isLoading.value"
    :disabled="!!participant.state.value"
    :text="text"
    @click="register.execute"
  />
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import type { IContestParticipantDTO } from './types'
import { useI18n } from 'vue-i18n'
import { http } from '@/utils/http'
import { HTTPError } from 'ky'
import { computed } from 'vue'
import { useAsyncTask } from '@/utils/async'

const props = defineProps<{
  contestId: string
  planId?: string
}>()

const { t } = useI18n()
const participant = useAsyncState(async () => {
  try {
    const resp = await http.get(`contest/${props.contestId}/self`).json<IContestParticipantDTO>()
    return resp
  } catch (err) {
    if (err instanceof HTTPError) {
      // Pre condition failed
      if (err.response.status === 412) {
        return null
      }
    } else {
      throw err
    }
  }
}, null)
const text = computed(() => (participant.state.value ? t('already-registered') : t('register')))
const register = useAsyncTask(async () => {
  const url = props.planId
    ? `plan/${props.planId}/contest/${props.contestId}/register`
    : `contest/${props.contestId}/register`
  await http.post(url)
  await participant.execute()
})
</script>

<i18n>
en:
  already-registered: Already Registered
zhHans:
  already-registered: 已报名
</i18n>
