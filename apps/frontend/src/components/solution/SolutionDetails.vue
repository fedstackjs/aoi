<template>
  <component :is="JsonViewer<SolutionDetails>" :endpoint="endpoint">
    <template v-slot="{ value }">
      <VCard variant="flat">
        <VCardSubtitle>{{ t('term.jobs') }}</VCardSubtitle>
        <VCardText>
          <VExpansionPanels variant="accordion">
            <VExpansionPanel v-for="(job, i) in value.jobs" :key="i">
              <!-- A Job named 'job' -->
              <VExpansionPanelTitle>
                <VRow no-gutters>
                  <VCol cols="6" class="justify-start">
                    {{ job.name }}
                  </VCol>
                  <VCol cols="4">
                    {{ job.status }}
                  </VCol>
                  <VCol cols="2"> {{ job.score }}/{{ job.scoreScale }} </VCol>
                </VRow>
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <VCardSubtitle>{{ t('term.tests') }}</VCardSubtitle>
                <VExpansionPanels class="pb-4">
                  <VExpansionPanel v-for="(test, i) in job.tests" :key="i">
                    <!-- A Subtask named 'subtask' -->
                    <VExpansionPanelTitle>
                      <VRow no-gutters>
                        <VCol cols="6" class="justify-start">
                          {{ test.name }}
                        </VCol>
                        <VCol cols="4">
                          {{ test.status }}
                        </VCol>
                        <VCol cols="2">
                          {{ test.score }}
                        </VCol>
                      </VRow>
                    </VExpansionPanelTitle>
                    <VExpansionPanelText>
                      <MarkdownRenderer :md="value.summary" />
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
                <VDivider />
                <VCardSubtitle>{{ t('term.summary') }}</VCardSubtitle>
                <MarkdownRenderer :md="value.summary" class="pa-4" />
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </VCardText>
        <VCardSubtitle>{{ t('term.summary') }}</VCardSubtitle>
        <MarkdownRenderer :md="value.summary" class="pa-4" />
      </VCard>
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import JsonViewer from '../utils/JsonViewer.vue'
import { useI18n } from 'vue-i18n'
import type { SolutionDetails } from '@aoi/common'
import MarkdownRenderer from '../utils/MarkdownRenderer.vue'

const { t } = useI18n()

const props = defineProps<{
  problemId?: string
  contestId?: string
  solutionId: string
}>()

const endpoint = computed(() =>
  props.contestId
    ? `contest/${props.contestId}/solution/${props.solutionId}/details`
    : `problem/${props.problemId}/solution/${props.solutionId}/details`
)
</script>
