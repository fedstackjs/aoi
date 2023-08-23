<template>
  <VCardSubtitle>{{ t('preconditions') }}</VCardSubtitle>
  <OptionalInput v-model="model.preConditionContests" :init="() => []">
    <template v-slot="scoped">
      <ListInput v-model="scoped.value" :init="() => ({ conditions: {}, contestId: '' })">
        <template v-slot="{ value }">
          <VCardSubtitle>{{ t('common-settings') }}</VCardSubtitle>
          <VSelect
            density="compact"
            label="Contest"
            v-model="value.contestId"
            :items="contests"
            item-title="title"
            item-value="_id"
          />
          <VTextField disabled density="compact" label="ContestId" v-model="value.contestId" />
          <VTextField
            density="compact"
            label="Min Total Score"
            type="number"
            min="0"
            v-model.number="value.conditions.minTotalScore"
          />
          <VCardSubtitle>{{ t('problems') }}</VCardSubtitle>
          <OptionalInput v-model="value.conditions.problems" :init="() => []">
            <template v-slot="scoped">
              <ListInput v-model="scoped.value" :init="() => ({ problemId: '', minScore: 0 })">
                <template v-slot="{ value }">
                  <VTextField density="compact" label="ProblemId" v-model="value.problemId" />
                  <VTextField
                    density="compact"
                    label="Min Score"
                    type="number"
                    min="0"
                    v-model.number="value.minScore"
                  />
                </template>
              </ListInput>
            </template>
          </OptionalInput>
        </template>
      </ListInput>
    </template>
  </OptionalInput>
</template>

<script setup lang="ts">
import type { IPlanContestSettings } from '@/types'
import OptionalInput from '../utils/OptionalInput.vue'
import ListInput from '../utils/ListInput.vue'
import { useI18n } from 'vue-i18n'
import type { IPlanContestDTO } from './types'

const model = defineModel<IPlanContestSettings>({ required: true })
defineProps<{
  contests: IPlanContestDTO[]
}>()
const { t } = useI18n()
</script>
