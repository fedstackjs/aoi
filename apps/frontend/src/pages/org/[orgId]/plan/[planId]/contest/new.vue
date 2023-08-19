<template>
  <VCard variant="flat" :title="t('add-contest')">
    <VCardText>
      <VTextField label="contestId" v-model="payload.contestId" />
      <PlanContestSettings v-model="payload.settings" />
    </VCardText>
    <VCardActions>
      <VBtn color="primary" variant="elevated" @click="addContest()">
        {{ t('add') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import PlanContestSettings from '@/components/plan/PlanContestSettings.vue'
import type { IPlanDTO, IPlanContestDTO } from '@/components/plan/types'
import { http } from '@/utils/http'
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const props = defineProps<{
  orgId: string
  planId: string
  plan: IPlanDTO
  contests: IPlanContestDTO[]
}>()
const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

const payload = reactive({
  contestId: '',
  settings: {}
})

async function addContest() {
  try {
    const { orgId, planId } = props
    await http.post(`plan/${planId}/contest`, {
      json: payload
    })
    router.replace(`/org/${orgId}/plan/${planId}/contest/${payload.contestId}`)
    emit('updated')
  } catch (err) {
    toast.error(`Error: ${err}`)
  }
}
</script>
