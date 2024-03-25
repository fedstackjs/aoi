<template>
  <AsyncState :state="settings">
    <template v-slot="scoped">
      <VCardText>
        <slot v-bind="scoped" />
      </VCardText>
      <VCardActions>
        <VBtn color="error" variant="elevated" @click="settings.execute()">
          {{ t('action.reset') }}
        </VBtn>
        <VBtn color="primary" variant="elevated" @click="patchSettings.execute()">
          {{ t('action.save') }}
        </VBtn>
      </VCardActions>
    </template>
  </AsyncState>
</template>

<script setup lang="ts" generic="T = any">
import { useAsyncState } from '@vueuse/core'
import { nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AsyncState from './AsyncState.vue'

import { useAsyncTask } from '@/utils/async'
import { http } from '@/utils/http'

const props = defineProps<{
  endpoint: string
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()

const settings = useAsyncState(
  async () => {
    return http.get(props.endpoint).json<T>()
  },
  null,
  { shallow: false }
)

watch(
  () => props.endpoint,
  () => settings.execute()
)

const patchSettings = useAsyncTask(async () => {
  await http.patch(props.endpoint, {
    json: settings.state.value
  })
  emit('updated')
  nextTick(() => settings.execute())
})
</script>
