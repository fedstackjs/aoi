<template>
  <VCard flat :title="t('term.settings')">
    <VDivider />
    <AccessLevelEditor
      :access-level="contest.accessLevel"
      :prefix="`contest/${contestId}/admin/accessLevel`"
      @updated="emit('updated')"
    />
    <VDivider />
    <VCardSubtitle>
      {{ t('term.danger-zone') }}
    </VCardSubtitle>
    <VCardActions>
      <VBtn
        color="red"
        variant="elevated"
        @click="submitAllTask.execute()"
        :loading="submitAllTask.isLoading.value"
      >
        {{ t('action.submit-all') }}
      </VBtn>
      <VBtn color="red" variant="elevated">
        {{ t('action.delete') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import type { IContestDTO } from '@/components/contest/types'
import AccessLevelEditor from '@/components/utils/AccessLevelEditor.vue'
import { useAsyncTask } from '@/utils/async'
import { http } from '@/utils/http'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()

const submitAllTask = useAsyncTask(async () => {
  http.post(`contest/${props.contestId}/admin/submit-all`)
})
</script>

<i18n>
en:
  action:
    submit-all: Submit all solutions
zh-Hans:
  action:
    submit-all: 提交所有解答
</i18n>
