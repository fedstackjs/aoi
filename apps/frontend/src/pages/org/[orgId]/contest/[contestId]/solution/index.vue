<template>
  <SolutionList
    :org-id="orgId"
    :contest-id="contestId"
    :self-only="!settings.solutionShowOther && !admin"
  />
</template>

<script setup lang="ts">
import type { IContestDTO } from '@/components/contest/types'
import SolutionList from '@/components/solution/SolutionList.vue'
import { useContestCapability, useContestSettings } from '@/utils/contest/inject'

defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()

const admin = useContestCapability('admin')
const settings = useContestSettings()
</script>
