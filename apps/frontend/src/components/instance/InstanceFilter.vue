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
          <template v-if="mode === InstanceListMode.GLOBAL">
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
          <template v-if="mode === InstanceListMode.CONTEST">
            <VCol cols="12">
              <ContestProblemIdInput
                v-model="local.problemId"
                :label="t('term.problem-id')"
                clearable
              />
            </VCol>
          </template>
          <VCol cols="12">
            <VSelect
              v-model="local.state"
              :items="stateOptions"
              :label="t('term.state')"
              clearable
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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ContestProblemIdInput from '../contest/ContestProblemIdInput.vue'
import IdInput from '../utils/IdInput.vue'
import UserIdInput from '../utils/UserIdInput.vue'

import { useInstanceFilter } from './InstanceFilter'
import { InstanceListMode } from './InstanceList'
import { InstanceState } from './types'

defineProps<{
  mode: InstanceListMode
  orgId: string
  selfOnly?: boolean
}>()

const { t } = useI18n()

const userId = defineModel<string>('userId', { default: '' })
const problemId = defineModel<string>('problemId', { default: '' })
const contestId = defineModel<string>('contestId', { default: '' })
const state = defineModel<string>('state', { default: '' })

const stateOptions = [
  { title: t('instance.state.destroyed'), value: InstanceState.DESTROYED },
  { title: t('instance.state.pending'), value: InstanceState.PENDING },
  { title: t('instance.state.queued'), value: InstanceState.QUEUED },
  { title: t('instance.state.active'), value: InstanceState.ACTIVE },
  { title: t('instance.state.error'), value: InstanceState.ERROR }
]

const dialog = ref(false)

const { local, reset, apply, filterActive } = useInstanceFilter({
  userId,
  problemId,
  contestId,
  state
})

const _apply = () => {
  dialog.value = false
  apply()
}
</script>
