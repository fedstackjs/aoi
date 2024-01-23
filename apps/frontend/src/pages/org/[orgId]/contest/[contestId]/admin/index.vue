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
      {{ t('action.rejudge-all') }}
    </VCardSubtitle>
    <VCardText>
      <VForm fast-fail validate-on="submit lazy" @submit.prevent="rejudgeAllTask.execute">
        <VTextField
          v-model="rejudgeOptions.problemId"
          :label="t('term.problem-id')"
          :rules="[isUUID, isNotEmpty]"
          :append-icon="rejudgeOptions.problemId === undefined ? 'mdi-null' : 'mdi-delete'"
          @click:append="rejudgeOptions.problemId = undefined"
        />
        <VSelect
          v-model="rejudgeOptions.state"
          :items="[
            { title: 'Pending', value: 1 },
            { title: 'Queued', value: 2 },
            { title: 'Running', value: 3 },
            { title: 'Completed', value: 4 }
          ]"
          :label="t('term.state')"
          :append-icon="rejudgeOptions.state === undefined ? 'mdi-null' : 'mdi-delete'"
          @click:append="rejudgeOptions.state = undefined"
        />
        <VTextField
          v-model="rejudgeOptions.status"
          :label="t('term.status')"
          :append-icon="rejudgeOptions.status === undefined ? 'mdi-null' : 'mdi-delete'"
          @click:append="rejudgeOptions.status = undefined"
        />
        <VTextField
          v-model="rejudgeOptions.runnerId"
          :rules="[isUUID]"
          :label="t('term.runner-id')"
          :append-icon="rejudgeOptions.runnerId === undefined ? 'mdi-null' : 'mdi-delete'"
          @click:append="rejudgeOptions.runnerId = undefined"
        />
        <VBtn
          color="red"
          variant="elevated"
          type="submit"
          :loading="rejudgeAllTask.isLoading.value"
        >
          {{ t('action.rejudge-all') }}
        </VBtn>
      </VForm>
    </VCardText>
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
import { useAsyncTask, withMessage, noMessage } from '@/utils/async'
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import { reactive } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { SubmitEventPromise } from 'vuetify'

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

const submitAllTask = useAsyncTask(async () => {
  const { modifiedCount } = await http
    .post(`contest/${props.contestId}/admin/submit-all`)
    .json<{ modifiedCount: number }>()
  return withMessage(t('msg.submit-all-success', { count: modifiedCount }))
})

const rejudgeOptions = reactive({
  problemId: undefined as string | undefined,
  state: undefined as number | undefined,
  status: undefined as string | undefined,
  runnerId: undefined as string | undefined
})
const rejudgeAllTask = useAsyncTask(async (ev: SubmitEventPromise) => {
  const result = await ev
  if (!result.valid) return noMessage()
  const { modifiedCount } = await http
    .post(`contest/${props.contestId}/admin/rejudge-all`, { json: rejudgeOptions })
    .json<{ modifiedCount: number }>()
  return withMessage(t('msg.rejudge-all-success', { count: modifiedCount }))
})

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

const isUUID = (value: string | undefined) => {
  if (!value) return true
  if (/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value)) return true
  return t('hint.not-valid-uuid')
}

const isNotEmpty = (value: string | undefined) => {
  if (typeof value !== 'string') return true
  if (value.length > 0) return true
  return t('hint.cannot-be-empty')
}
</script>

<i18n>
en:
  ranklist-state: Ranklist State is {state}
  reset-runner: Switch Reset Runner
  action:
    update-ranklists: Update ranklists
  hint:
    not-valid-uuid: Not a valid UUID
    cannot-be-empty: Cannot be empty
zh-Hans:
  ranklist-state: '排行榜状态: {state}'
  reset-runner: 切换重置运行器
  action:
    update-ranklists: 更新排行榜
  hint:
    not-valid-uuid: 不是一个有效的 UUID
    cannot-be-empty: 不能为空
</i18n>
