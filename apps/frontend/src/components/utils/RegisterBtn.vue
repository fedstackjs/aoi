<template>
  <VBtn
    color="blue"
    :loading="participant.isLoading.value || register.isLoading.value"
    :disabled="!!participant.state.value"
    :text="text"
    @click="register.execute"
  />
</template>

<script setup lang="ts" generic="Data,  Shallow extends boolean = true">
import { type UseAsyncStateReturn } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { http } from '@/utils/http'
import { computed } from 'vue'
import { useAsyncTask } from '@/utils/async'

const props = defineProps<{
  endpoint: string
  participant: UseAsyncStateReturn<Data, [], Shallow>
}>()

const { t } = useI18n()
const text = computed(() =>
  props.participant.state.value ? t('already-registered') : t('register')
)
const register = useAsyncTask(async () => {
  await http.post(props.endpoint)
  await props.participant.execute()
})
</script>

<i18n>
en:
  already-registered: Already Registered
zhHans:
  already-registered: 已报名
</i18n>
