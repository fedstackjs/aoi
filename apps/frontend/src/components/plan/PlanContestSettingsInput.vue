<template>
  <VCardSubtitle>{{ t('term.preconditions') }}</VCardSubtitle>
  <OptionalInput v-model="model.preConditionContests" :init="() => []">
    <template v-slot="scoped">
      <ListInput v-model="scoped.value" :init="() => ({ conditions: {}, contestId: '' })">
        <template v-slot="{ value }">
          <VCardSubtitle>{{ t('common-settings') }}</VCardSubtitle>
          <VSelect
            density="compact"
            :label="t('term.contest')"
            v-model="value.contestId"
            :items="contests"
            item-title="title"
            item-value="_id"
          />
          <VTextField
            disabled
            density="compact"
            :label="t('term.contest-id')"
            v-model="value.contestId"
          />
          <VTextField
            density="compact"
            :label="t('min-total-score')"
            type="number"
            min="0"
            v-model.number="value.conditions.minTotalScore"
          />
          <VCardSubtitle>{{ t('term.problem') }}</VCardSubtitle>
          <OptionalInput v-model="value.conditions.problems" :init="() => []">
            <template v-slot="scoped">
              <ListInput v-model="scoped.value" :init="() => ({ problemId: '', minScore: 0 })">
                <template v-slot="{ value }">
                  <VTextField
                    density="compact"
                    :label="t('term.problem-id')"
                    v-model="value.problemId"
                  />
                  <VTextField
                    density="compact"
                    :label="t('min-score')"
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
<i18n>
en:
  common-settings: Common Settings
  min-total-score: Minimal Total Score
  min-score: Minimal Score
zhHans:
  common-settings: 总设置
  min-total-score: 最小总分数
  min-score: 最小分数
</i18n>
