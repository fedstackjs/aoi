<template>
  <VDialog v-model="dialog" width="auto">
    <template v-slot:activator="{ props }">
      <VBtn
        color="primary"
        v-bind="props"
        :variant="filterActive ? 'flat' : 'tonal'"
        :prepend-icon="filterActive ? 'mdi-filter-check-outline' : 'mdi-filter-plus-outline'"
        :text="t('term.filter')"
      />
    </template>

    <VCard :title="t('term.filter')">
      <VContainer>
        <VRow>
          <VCol cols="12">
            <UserIdInput
              v-model="local.userId"
              :label="t('term.user-id')"
              :disabled="selfOnly"
              clearable
            />
          </VCol>
          <template v-if="mode === SolutionListMode.GLOBAL">
            <VCol cols="12" sm="6">
              <IdInput
                :label="t('term.contest-id')"
                v-model="local.contestId"
                endpoint="contest"
                :search="{ orgId }"
                clearable
              />
            </VCol>
            <VCol cols="12" sm="6">
              <IdInput
                :label="t('term.problem-id')"
                v-model="local.problemId"
                endpoint="problem"
                :search="{ orgId }"
                clearable
              />
            </VCol>
          </template>
          <template v-if="mode === SolutionListMode.CONTEST">
            <VCol cols="12">
              <ContestProblemIdInput
                v-model="local.problemId"
                :label="t('term.problem-id')"
                clearable
              />
            </VCol>
          </template>
          <VCol cols="12" sm="6">
            <VSelect
              v-model="local.state"
              :items="stateOptions"
              :label="t('term.state')"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VCombobox
              v-model="local.status"
              :items="statusOptions"
              :label="t('term.status')"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              :error="!!submittedLError"
              v-model="submittedLModel"
              type="datetime-local"
              :label="t('solution.submitted-since')"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              :error="!!submittedRError"
              v-model="submittedRModel"
              type="datetime-local"
              :label="t('solution.submitted-before')"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="local.scoreL"
              type="number"
              min="0"
              :max="scoreR"
              :label="t('solution.min-score')"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="local.scoreR"
              type="number"
              max="100"
              :min="scoreL"
              :label="t('solution.max-score')"
            />
          </VCol>
        </VRow>
      </VContainer>
      <VCardActions>
        <VBtn @click="reset" color="error" :text="t('action.reset')" />
        <VBtn @click="_apply" :text="t('action.apply')" />
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { SolutionListMode } from './SolutionList'
import { useI18n } from 'vue-i18n'
import UserIdInput from '../utils/UserIdInput.vue'
import { useSolutionFilter } from './SolutionFilter'
import { useSolutionStateOptions, useSolutionStatusOptions } from '@/utils/solution'
import { useDateTimeStrTextField } from '@/utils/time'
import ContestProblemIdInput from '../contest/ContestProblemIdInput.vue'
import { ref, toRef } from 'vue'
import IdInput from '../utils/IdInput.vue'

defineProps<{
  mode: SolutionListMode
  orgId: string
  selfOnly?: boolean
}>()

const { t } = useI18n()

const userId = defineModel<string>('userId', { default: '' })
const contestId = defineModel<string>('contestId', { default: '' })
const problemId = defineModel<string>('problemId', { default: '' })
const state = defineModel<string>('state', { default: '' })
const status = defineModel<string>('status', { default: '' })
const submittedL = defineModel<string>('submittedL', { default: '' })
const submittedR = defineModel<string>('submittedR', { default: '' })
const scoreL = defineModel<string>('scoreL', { default: '' })
const scoreR = defineModel<string>('scoreR', { default: '' })

const stateOptions = useSolutionStateOptions()
const statusOptions = useSolutionStatusOptions()

const dialog = ref(false)

const { local, reset, apply, filterActive } = useSolutionFilter({
  userId,
  contestId,
  problemId,
  state,
  status,
  submittedL,
  submittedR,
  scoreL,
  scoreR
})

const _apply = () => {
  dialog.value = false
  apply()
}

const { model: submittedLModel, error: submittedLError } = useDateTimeStrTextField(
  toRef(local, 'submittedL')
)
const { model: submittedRModel, error: submittedRError } = useDateTimeStrTextField(
  toRef(local, 'submittedR')
)
</script>
