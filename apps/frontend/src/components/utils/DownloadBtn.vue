<template>
  <VBtn @click="task.execute()" :loading="task.isLoading.value">
    {{ t('action.download') }}
  </VBtn>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useAsyncTask } from '@/utils/async'
import { http } from '@/utils/http'

const props = defineProps<{
  endpoint: string
}>()
const { t } = useI18n()

const task = useAsyncTask(async () => {
  const { url } = await http.get(`${props.endpoint}/download`).json<{ url: string }>()
  window.open(url)
})
</script>
