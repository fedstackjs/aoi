<template>
  <AsyncState :state="app.orgProfile" hide-when-loading>
    <RouterView />
    <template #loading>
      <VContainer>
        <VRow>
          <VCol>
            <VSkeletonLoader />
          </VCol>
        </VRow>
      </VContainer>
    </template>
  </AsyncState>
</template>

<script setup lang="ts">
import AsyncState from '@/components/utils/AsyncState.vue'
import { useAppState } from '@/stores/app'

defineProps<{
  orgId: string
}>()

const app = useAppState()
</script>
