<template>
  <VBtn
    color="blue"
    :loading="participant.isLoading.value || register.isLoading.value"
    :disabled="disabled || !!participant.state.value"
    :text="text"
    @click="register.execute"
  />
</template>

<script setup lang="ts" generic="Data, Shallow extends boolean = true">
import { type UseAsyncStateReturn } from '@vueuse/core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useAsyncTask } from '@/utils/async'
import { http } from '@/utils/http'

const props = defineProps<{
  endpoint: string
  participant: UseAsyncStateReturn<Data, [], Shallow>
  disabled?: boolean
}>()

const { t } = useI18n()
const text = computed(() =>
  props.participant.state.value ? t('already-registered') : t('contest-register')
)
const register = useAsyncTask(async () => {
  await http.post(props.endpoint)
  await props.participant.execute()
})
</script>

<i18n>
en:
  contest-register: Register
  already-registered: Already Registered
zh-Hans:
  contest-register: 报名
  already-registered: 已报名
</i18n>
