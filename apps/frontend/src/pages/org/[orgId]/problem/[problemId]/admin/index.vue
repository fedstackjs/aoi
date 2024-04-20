<template>
  <VCard flat :title="t('term.settings')">
    <VDivider />
    <SettingsEditor :endpoint="`problem/${problemId}/admin/settings`">
      <template v-slot="scoped">
        <ProblemSettingsInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
    <VDivider />
    <AccessLevelEditor
      :access-level="problem.accessLevel"
      :prefix="`problem/${problemId}/admin/accessLevel`"
      @updated="emit('updated')"
    />
    <VDivider />
    <VCardSubtitle>
      {{ t('term.danger-zone') }}
    </VCardSubtitle>
    <VCardText>
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

      <VBtn color="red" variant="elevated" @click="deleteProblem()">
        {{ t('action.delete') }}
      </VBtn>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import ProblemSettingsInput from '@/components/problem/ProblemSettingsInput.vue'
import type { IProblemDTO } from '@/components/problem/types'
import AccessLevelEditor from '@/components/utils/AccessLevelEditor.vue'
import SettingsEditor from '@/components/utils/SettingsEditor.vue'
import { useAsyncTask, withMessage } from '@/utils/async'
import { http } from '@/utils/http'

const props = defineProps<{
  orgId: string
  problemId: string
  problem: IProblemDTO
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
const router = useRouter()

const submitAllTask = useAsyncTask(async () => {
  const { modifiedCount } = await http
    .post(`problem/${props.problemId}/admin/submit-all`)
    .json<{ modifiedCount: number }>()
  return withMessage(t('msg.submit-all-success', { count: modifiedCount }))
})

const pull = ref(true)
const rejudgeAllTask = useAsyncTask(async () => {
  const { modifiedCount } = await http
    .post(`problem/${props.problemId}/admin/rejudge-all`, { json: { pull: pull.value } })
    .json<{ modifiedCount: number }>()
  return withMessage(t('msg.rejudge-all-success', { count: modifiedCount }))
})

async function deleteProblem() {
  await http.delete(`problem/${props.problemId}/admin`)
  router.push(`/org/${props.orgId}/problem`)
  emit('updated')
}
</script>
