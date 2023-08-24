<template>
  <VCard flat>
    <SettingsEditor :endpoint="`plan/${planId}/contest/${contest._id}/settings`">
      <template v-slot="scoped">
        <PlanContestSettingsInput v-model="scoped.value" :contests="contests" />
      </template>
    </SettingsEditor>
    <VDivider />
    <VCardActions>
      <VBtn color="error" variant="elevated" @click="deleteProblem()">
        {{ t('action.delete') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { http } from '@/utils/http'
import type { IPlanContestDTO } from './types'
import { useRoute, useRouter } from 'vue-router'
import SettingsEditor from '../utils/SettingsEditor.vue'
import PlanContestSettingsInput from './PlanContestSettingsInput.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const props = defineProps<{
  planId: string
  contests: IPlanContestDTO[]
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
