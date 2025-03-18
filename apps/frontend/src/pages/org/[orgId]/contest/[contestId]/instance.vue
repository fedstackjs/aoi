<template>
  <VCard>
    <InstanceList :org-id="orgId" :contest-id="contestId" :self-only="!admin" />
  </VCard>
</template>

<script setup lang="ts">
import type { IContestDTO } from '@/components/contest/types'
import InstanceList from '@/components/instance/InstanceList.vue'
import { useContestCapability } from '@/utils/contest/inject'

defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()

const admin = useContestCapability('admin')
</script>
