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
      <VBtn
        color="red"
        variant="elevated"
        @click="updateRanklistsTask.execute()"
        :loading="updateRanklistsTask.isLoading.value"
      >
        {{ t('action.update-ranklists') }}
      </VBtn>
      <VBtn color="red" variant="elevated" @click="deleteContest()">
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
import { useRouter } from 'vue-router'

const props = defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
const router = useRouter()

const submitAllTask = useAsyncTask(() => http.post(`contest/${props.contestId}/admin/submit-all`))

const updateRanklistsTask = useAsyncTask(() =>
  http.post(`contest/${props.contestId}/admin/update-ranklists`)
)

async function deleteContest() {
  await http.delete(`contest/${props.contestId}/admin`)
  router.push(`/org/${props.orgId}/contest`)
  emit('updated')
}
</script>

<i18n>
en:
  action:
    submit-all: Submit all solutions
    update-ranklists: Update ranklists
zh-Hans:
  action:
    submit-all: 提交所有解答
    update-ranklists: 更新排行榜
</i18n>
