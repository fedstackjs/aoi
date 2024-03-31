<template>
  <SettingsEditor :endpoint="endpoint" allow-delete text :init="() => ({})">
    <template v-slot="{ value }">
      <MonacoEditor v-model="value.text" language="json" :uri="`internal://${id}.json`" />
    </template>
  </SettingsEditor>
</template>

<script setup lang="ts">
import { watch } from 'vue'

import MonacoEditor from '../utils/MonacoEditor.vue'
import SettingsEditor from '../utils/SettingsEditor.vue'

import monaco from '@/utils/monaco'

const props = defineProps<{
  id: string
  endpoint: string
  schema: unknown
}>()

watch(
  () => props.id,
  (id) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      schemas: [
        {
          fileMatch: [`${id}.json`],
          uri: `internal://${id}.schema.json`,
          schema: props.schema
        }
      ]
    })
  },
  { immediate: true }
)
</script>
