<template>
  <VCard variant="flat">
    <AsyncState :state="problem">
      <template v-slot="{ value }">
        <VCardTitle class="d-flex justify-between">
          <div>
            <p class="text-h4">{{ value.title }}</p>
          </div>
          <div>
            <VChipGroup class="justify-end">
              <VChip v-for="tag in value.tags" class="mx-2" :key="tag">
                {{ tag }}
              </VChip>
            </VChipGroup>
          </div>
        </VCardTitle>
        <VDivider />

        <VTabs v-model="currentTab">
          <VTab prepend-icon="mdi-book-outline" value="desc">
            {{ t('problem-description') }}
          </VTab>
          <VTab prepend-icon="mdi-upload-outline" value="submit">
            {{ t('problem-submit') }}
          </VTab>
          <VTab prepend-icon="mdi-attachment" value="attachments">
            {{ t('problem-attachments') }}
          </VTab>
          <VTab prepend-icon="mdi-cog-outline" value="management">
            {{ t('problem-management') }}
          </VTab>
        </VTabs>
        <VWindow v-model="currentTab">
          <VWindowItem value="desc">
            <VCard flat>
              <MarkdownRenderer :md="value.description" class="pa-4" />
            </VCard>
          </VWindowItem>
          <VWindowItem value="submit">
            <ProblemSubmit :contest-id="contestId" :problem="value" />
          </VWindowItem>
          <VWindowItem value="attachments">
            <ProblemTabAttachments :contest-id="contestId" :problem="value" />
          </VWindowItem>
          <VWindowItem value="management">
            <ProblemTabAdmin :contest-id="contestId" :problem="value" @updated="emit('updated')" />
          </VWindowItem>
        </VWindow>
      </template>
    </AsyncState>
  </VCard>
</template>

<script setup lang="ts">
import AsyncState from '@/components/utils/AsyncState.vue'
import MarkdownRenderer from '@/components/utils/MarkdownRenderer.vue'
import ProblemSubmit from '@/components/problem/ProblemSubmit.vue'
import type {
  IContestDTO,
  IContestProblemDTO,
  IContestProblemListDTO
} from '@/components/contest/types'
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import ProblemTabAttachments from '@/components/contest/ProblemTabAttachments.vue'
import ProblemTabAdmin from '@/components/contest/ProblemTabAdmin.vue'

const props = defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
  problems: IContestProblemListDTO[]
  problemId: string
}>()

const { t } = useI18n()
const currentTab = ref()
const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const problem = useAsyncState(async () => {
  const resp = await http.get(`contest/${props.contestId}/problem/${props.problemId}`)
  return resp.json<IContestProblemDTO>()
}, null)
</script>
