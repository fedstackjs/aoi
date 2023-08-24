<template>
  <VCard variant="flat" :title="t('add-problem')">
    <VCardText>
      <VTextField label="ID" v-model="payload.problemId" />
      <ContestProblemSettingsInput v-model="payload.settings" />
    </VCardText>
    <VCardActions>
      <VBtn color="primary" variant="elevated" @click="addProblem()">
        {{ t('action.add') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import ContestProblemSettingsInput from '@/components/contest/ContestProblemSettingsInput.vue'
import type { IContestDTO, IContestProblemListDTO } from '@/components/contest/types'
import { http } from '@/utils/http'
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const props = defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
  problems: IContestProblemListDTO[]
}>()
const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

const payload = reactive({
  problemId: '',
  settings: {
    score: 100,
    slug: 'A',
    solutionCountLimit: 10,
    showAfter: 0
  }
})

async function addProblem() {
  try {
    const { orgId, contestId } = props
    await http.post(`contest/${contestId}/problem`, {
      json: payload
    })
    router.replace(`/org/${orgId}/contest/${contestId}/problem/${payload.problemId}`)
    emit('updated')
  } catch (err) {
    toast.error(`Error: ${err}`)
  }
}
</script>
<i18n>
en:
  add-problem: Add problem
zhHans:
  add-problem: 添加题目
</i18n>
