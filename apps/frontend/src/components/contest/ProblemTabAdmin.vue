<template>
  <VCard flat>
    <SettingsEditor :endpoint="`contest/${contestId}/problem/${problem._id}/settings`">
      <template v-slot="scoped">
        <ContestProblemSettingsInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
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
import type { IContestProblemDTO } from './types'
import { useRoute, useRouter } from 'vue-router'
import SettingsEditor from '@/components/utils/SettingsEditor.vue'
import ContestProblemSettingsInput from './ContestProblemSettingsInput.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const props = defineProps<{
  contestId: string
  problem: IContestProblemDTO
}>()
const emit = defineEmits<{
  (ev: 'updated'): void
}>()

async function deleteProblem() {
  await http.delete(`contest/${props.contestId}/problem/${props.problem._id}`)
  router.push(`/org/${route.params.orgId}/contest/${props.contestId}/problem`)
  emit('updated')
}
</script>
