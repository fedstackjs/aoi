<template>
  <template v-if="demoPlans.isReady">
    <VContainer class="pa-0">
      <VRow v-for="(plan, i) in demoPlans.state.value" :key="i">
        <VCol>
          <PlanCard :org-id="props.orgId" :plan-id="plan._id" />
        </VCol>
      </VRow>
    </VContainer>
  </template>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'

import PlanCard from './PlanCard.vue'

import { http } from '@/utils/http'

const props = defineProps<{ orgId: string }>()

const demoPlans = useAsyncState(async () => {
  const resp = await http.get('plan/demo', {
    searchParams: {
      orgId: props.orgId
    }
  })
  return resp.json<Array<{ _id: string }>>()
}, [])
</script>
