<template>
  <VCard variant="flat">
    <VCardSubtitle>{{ t('term.jobs') }}</VCardSubtitle>
    <VCardText>
      <VExpansionPanels v-if="value.jobs" variant="accordion">
        <VExpansionPanel v-for="(job, i) in value.jobs" :key="i">
          <!-- A Job named 'job' -->
          <VExpansionPanelTitle>
            <VRow no-gutters>
              <VCol cols="6" class="d-flex justify-start align-center">
                {{ job.name }}
              </VCol>
              <VCol cols="4">
                <SolutionStatusChip :status="job.status" />
              </VCol>
              <VCol v-if="legacy" cols="2"> {{ job.score }}/{{ job.scoreScale }} </VCol>
              <VCol v-else cols="2">
                <SolutionScoreDisplay :score="job.score" :score-scale="job.scoreScale" />
              </VCol>
            </VRow>
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <VCardSubtitle>{{ t('term.tests') }}</VCardSubtitle>
            <VExpansionPanels v-if="job.tests" class="pb-4">
              <VExpansionPanel v-for="(test, i) in job.tests" :key="i">
                <!-- A Subtask named 'subtask' -->
                <VExpansionPanelTitle>
                  <VRow no-gutters>
                    <VCol cols="6" class="d-flex justify-start align-center">
                      {{ test.name }}
                    </VCol>
                    <VCol cols="4">
                      <SolutionStatusChip :status="test.status" />
                    </VCol>
                    <VCol v-if="legacy" cols="2">
                      {{ test.score }}
                    </VCol>
                    <VCol v-else cols="2">
                      <SolutionScoreDisplay :score="test.score" :score-scale="test.scoreScale" />
                    </VCol>
                  </VRow>
                </VExpansionPanelTitle>
                <VExpansionPanelText v-if="test.summary">
                  <MarkdownRenderer :md="test.summary" />
                </VExpansionPanelText>
              </VExpansionPanel>
            </VExpansionPanels>
            <template v-if="job.summary">
              <VDivider />
              <VCardSubtitle>{{ t('term.summary') }}</VCardSubtitle>
              <MarkdownRenderer :md="job.summary" class="pa-4" />
            </template>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </VCardText>
    <template v-if="value.summary">
      <VCardSubtitle>{{ t('term.summary') }}</VCardSubtitle>
      <MarkdownRenderer :md="value.summary" class="pa-4" />
    </template>
  </VCard>
</template>

<script setup lang="ts">
import type { SolutionDetails } from '@aoi-js/common'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import MarkdownRenderer from '../utils/MarkdownRenderer.vue'

import SolutionScoreDisplay from './SolutionScoreDisplay.vue'
import SolutionStatusChip from './SolutionStatusChip.vue'

const { t } = useI18n()

const props = defineProps<{
  value: SolutionDetails
}>()

const legacy = computed(() => !('version' in props.value))
</script>
