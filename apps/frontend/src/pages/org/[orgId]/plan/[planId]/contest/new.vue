<template>
  <VCard variant="flat" :title="t('add-contest')">
    <VCardText>
      <VTextField :label="t('term.contest-id')" v-model="payload.contestId" />
      <PlanContestSettingsInput v-model="payload.settings" :contests="props.contests" />
    </VCardText>
    <VCardActions>
      <VBtn color="primary" variant="elevated" @click="addContest()">
        {{ t('action.add') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import PlanContestSettingsInput from '@/components/plan/PlanContestSettingsInput.vue'
import type { IPlanDTO, IPlanContestDTO } from '@/components/plan/types'
import { http } from '@/utils/http'
import { nextTick, reactive } from 'vue'
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
  settings: {
    slug: ''
  }
})

async function addContest() {
  try {
    const { orgId, planId } = props
    await http.post(`plan/${planId}/contest`, {
      json: payload
    })
    emit('updated')
    await nextTick()
    router.replace(`/org/${orgId}/plan/${planId}/contest/${payload.contestId}`)
  } catch (err) {
    toast.error(`Error: ${err}`)
  }
}
</script>
<i18n>
en:
  add-contest: Add contest
zh-Hans:
  add-contest: 添加比赛
</i18n>
