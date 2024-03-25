<template>
  <VCard flat>
    <SettingsEditor :endpoint="`contest/${contestId}/problem/${problem._id}/settings`">
      <template v-slot="scoped">
        <ContestProblemSettingsInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
    <VCardActions>
      <VBtn
        color="red"
        variant="elevated"
        @click="submitAllTask.execute()"
        :loading="submitAllTask.isLoading.value"
      >
        {{ t('action.submit-all') }}
      </VBtn>
      <VBtn
        color="red"
        variant="elevated"
        :append-icon="pull ? 'mdi-source-pull' : 'mdi-pin'"
        @click="rejudgeAllTask.execute()"
        @click.middle="pull = !pull"
        :loading="rejudgeAllTask.isLoading.value"
      >
        {{ t('action.rejudge-all') }}
      </VBtn>

      <VBtn color="error" variant="elevated" @click="deleteProblem()">
        {{ t('action.delete') }}
      </VBtn>
    </VCardActions>
    <VCardActions>
      <VBtn color="primary" variant="elevated" @click="gotoProblemAdmin()">
        {{ t('goto-problem-admin') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import ContestProblemSettingsInput from './ContestProblemSettingsInput.vue'
import type { IContestProblemDTO } from './types'

import SettingsEditor from '@/components/utils/SettingsEditor.vue'
import { useAsyncTask, withMessage } from '@/utils/async'
import { http } from '@/utils/http'

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

const submitAllTask = useAsyncTask(async () => {
  const { modifiedCount } = await http
    .post(`contest/${props.contestId}/problem/${props.problem._id}/submit-all`)
    .json<{ modifiedCount: number }>()
  return withMessage(t('msg.submit-all-success', { count: modifiedCount }))
})

const pull = ref(false)
const rejudgeAllTask = useAsyncTask(async () => {
  const { modifiedCount } = await http
    .post(`contest/${props.contestId}/problem/${props.problem._id}/rejudge-all`, {
      json: { pull: pull.value }
    })
    .json<{ modifiedCount: number }>()
  return withMessage(t('msg.rejudge-all-success', { count: modifiedCount }))
})

async function deleteProblem() {
  await http.delete(`contest/${props.contestId}/problem/${props.problem._id}`)
  router.push(`/org/${route.params.orgId}/contest/${props.contestId}/problem`)
  emit('updated')
}

function gotoProblemAdmin() {
  router.push(`/org/${route.params.orgId}/problem/${props.problem._id}/admin`)
}
</script>
<i18n>
en:
  goto-problem-admin: Go to problem admin
zh-Hans:
  goto-problem-admin: 跳转到题目管理页面
</i18n>
