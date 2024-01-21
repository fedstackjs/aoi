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
        :append-icon="resetRunner ? 'mdi-refresh' : 'mdi-pin'"
      >
        {{ t('action.update-ranklists') }}
      </VBtn>
      <VBtn color="red" variant="outlined" @click="resetRunner = !resetRunner">
        {{ t('reset-runner') }}
      </VBtn>

      <VBtn color="red" variant="elevated" @click="deleteContest()">
        {{ t('action.delete') }}
      </VBtn>
    </VCardActions>
    <VDivider />
    <VCardActions class="u-gap-2">
      <VBtn
        variant="tonal"
        color="blue"
        :loading="ranklistInfo.isLoading.value"
        prepend-icon="mdi-refresh"
        @click="ranklistInfo.execute()"
      >
        {{ t('ranklist-state', { state: ranklistStates[ranklistInfo.state.value.ranklistState] }) }}
      </VBtn>
      <VChip prepend-icon="mdi-calendar-clock" color="green">
        {{ new Date(ranklistInfo.state.value.ranklistUpdatedAt).toLocaleString() }}
      </VChip>
      <VChip prepend-icon="mdi-server-network" color="orange" class="u-font-mono">
        {{ ranklistInfo.state.value.ranklistRunnerId ?? 'Pending' }}
      </VChip>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import type { IContestDTO } from '@/components/contest/types'
import AccessLevelEditor from '@/components/utils/AccessLevelEditor.vue'
import { useAsyncTask } from '@/utils/async'
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import { ref } from 'vue'
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

const ranklistStates: Record<number, string> = {
  '-1': '[Loading...]',
  0: 'Valid',
  1: 'Pending',
  2: 'Invalid'
}

const ranklistInfo = useAsyncState(
  () =>
    http.get(`contest/${props.contestId}/admin/ranklist-info`).json<{
      ranklistState: number
      ranklistUpdatedAt: number
      ranklistRunnerId?: string
    }>(),
  {
    ranklistState: -1,
    ranklistUpdatedAt: 0
  },
  { immediate: true }
)

const resetRunner = ref(false)

const updateRanklistsTask = useAsyncTask(() =>
  http
    .post(`contest/${props.contestId}/admin/update-ranklists`, {
      json: { resetRunner: resetRunner.value }
    })
    .then(() => ranklistInfo.execute())
)

async function deleteContest() {
  await http.delete(`contest/${props.contestId}/admin`)
  router.push(`/org/${props.orgId}/contest`)
  emit('updated')
}
</script>

<i18n>
en:
  ranklist-state: Ranklist State is {state}
  reset-runner: Switch Reset Runner
  action:
    submit-all: Submit all solutions
    update-ranklists: Update ranklists
zh-Hans:
  ranklist-state: '排行榜状态: {state}'
  reset-runner: 切换重置运行器
  action:
    submit-all: 提交所有解答
    update-ranklists: 更新排行榜
</i18n>
