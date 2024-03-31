<template>
  <AsyncState :state="rules">
    <template v-slot="{ value }">
      <VExpansionPanels flat>
        <VExpansionPanel v-for="rule in value" :key="rule[0]" :title="rule[0]">
          <VExpansionPanelText>
            <RuleEditor
              :endpoint="`${endpoint}/${rule[0]}`"
              :id="`${id}.${rule[0]}`"
              :schema="rule[1]"
            />
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </template>
  </AsyncState>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'

import AsyncState from '../utils/AsyncState.vue'

import RuleEditor from './RuleEditor.vue'

import { http } from '@/utils/http'

const props = defineProps<{
  endpoint: string
  id: string
}>()

const rules = useAsyncState(async () => {
  const mapping = await http.get(props.endpoint).json<Record<string, unknown>>()
  return Object.entries(mapping)
}, [])
</script>
