<template>
  <AsyncState :state="data" hide-when-loading>
    <template v-slot="{ value }">
      <VTabs v-model="currentTab">
        <VTab prepend-icon="mdi-form-textarea" value="visual" v-if="slots.default">
          {{ t('visualized') }}
        </VTab>
        <VTab prepend-icon="mdi-code-json" value="raw">
          {{ t('raw') }}
        </VTab>
        <VTab prepend-icon="mdi-refresh" @click="data.execute()">
          {{ t('action.refresh') }}
        </VTab>
      </VTabs>
      <VWindow v-model="currentTab">
        <VWindowItem value="visual" v-if="slots.default">
          <slot :value="value"></slot>
        </VWindowItem>
        <VWindowItem value="raw">
          <MonacoEditor readonly language="json" :model-value="JSON.stringify(value, null, 2)" />
        </VWindowItem>
      </VWindow>
    </template>
    <template #error="{ state, error }">
      <slot name="error" :state="state" :error="error"></slot>
    </template>
  </AsyncState>
</template>

<script setup lang="ts" generic="T">
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import { ref } from 'vue'
import { useSlots } from 'vue'
import { useI18n } from 'vue-i18n'
import MonacoEditor from './MonacoEditor.vue'
import AsyncState from './AsyncState.vue'
import ky from 'ky'

const props = defineProps<{
  endpoint?: string
  url?: string
  rawData?: T
  rawString?: string
}>()
const slots = useSlots()
const { t } = useI18n()
const currentTab = ref()

async function resolveUrl() {
  if (props.url) return props.url
  if (props.endpoint) {
    const { url } = await http.get(`${props.endpoint}/download`).json<{ url: string }>()
    return url
  }
  throw new Error('No url or endpoint provided')
}

const data = useAsyncState(async () => {
  if (props.rawData) return props.rawData
  if (props.rawString) return JSON.parse(props.rawString)
  const url = await resolveUrl()
  const json = await ky.get(url).json<T>()
  return json
}, null)
</script>
<i18n>
en:
  visualized: Visualized
  raw: Raw
zh-Hans:
  visualized: 可视化
  raw: 原始数据
</i18n>
