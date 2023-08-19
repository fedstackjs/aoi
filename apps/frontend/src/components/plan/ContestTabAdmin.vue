<template>
  <VCard flat>
    <VCardActions>
      <VBtn color="error" variant="elevated" @click="deleteProblem()">
        {{ t('delete') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { http } from '@/utils/http'
import type { IPlanContestDTO } from './types'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const props = defineProps<{
  planId: string
  contest: IPlanContestDTO
}>()
const emit = defineEmits<{
  (ev: 'updated'): void
}>()

async function deleteProblem() {
  await http.delete(`plan/${props.planId}/contest/${props.contest._id}`)
  router.push(`/org/${route.params.orgId}/plan/${props.planId}/contest`)
  emit('updated')
}
</script>
