<template>
  <VCard variant="flat">
    <VCardText v-if="!contests.length">
      <VAlert type="info">{{ t('msg.no-contest') }}</VAlert>
    </VCardText>
    <template v-else>
      <VCardTitle>Contests of this Plan</VCardTitle>
      <VCardText> There are total {{ contests.length }} contests! </VCardText>
    </template>
  </VCard>
</template>

<script setup lang="ts">
import type { IPlanDTO, IPlanContestDTO } from '@/components/plan/types'
import { enableOverview } from '@/utils/flags'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const props = defineProps<{
  orgId: string
  planId: string
  plan: IPlanDTO
  contests: IPlanContestDTO[]
}>()

const { t } = useI18n()

if (!enableOverview && props.contests.length) {
  const router = useRouter()
  router.replace(`/org/${props.orgId}/plan/${props.planId}/contest/${props.contests[0]._id}`)
}
</script>
