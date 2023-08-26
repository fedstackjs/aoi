<template>
  <VCard variant="flat">
    <AsyncState :state="contest" hide-when-loading>
      <template v-slot="{ value }">
        <VCardTitle class="d-flex justify-space-between">
          <div>
            <p class="text-h4">{{ value.title }}</p>
          </div>
          <div>
            <VChipGroup class="justify-end">
              <VChip v-for="tag in value.tags" class="mx-2" :key="tag">
                {{ tag }}
              </VChip>
            </VChipGroup>
            <RegisterBtn
              :endpoint="`plan/${planId}/contest/${contestId}/register`"
              :participant="participant"
            />
          </div>
        </VCardTitle>
        <VDivider />
        <ContestProgressBar :contest="value" @updated="contest.execute()" />
        <VDivider />

        <VTabs v-model="currentTab">
          <VTab prepend-icon="mdi-book-outline" value="desc">
            {{ t('tabs.description') }}
          </VTab>
          <VTab v-if="admin" prepend-icon="mdi-cog-outline" value="management">
            {{ t('tabs.management') }}
          </VTab>
        </VTabs>
        <VWindow v-model="currentTab">
          <VWindowItem value="desc">
            <VCard flat>
              <MarkdownRenderer :md="value.description" class="pa-4" />
            </VCard>
          </VWindowItem>
          <VWindowItem value="management">
            <ContestTabAdmin
              :plan-id="planId"
              :contest="currentContest"
              :contests="contests"
              @updated="$emit('updated')"
            />
          </VWindowItem>
        </VWindow>
      </template>
    </AsyncState>
  </VCard>
</template>

<script setup lang="ts">
import AsyncState from '@/components/utils/AsyncState.vue'
import MarkdownRenderer from '@/components/utils/MarkdownRenderer.vue'
import type { IPlanDTO, IPlanContestDTO } from '@/components/plan/types'
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import ContestTabAdmin from '@/components/plan/ContestTabAdmin.vue'
import type { IContestDTO, IContestParticipantDTO } from '@/components/contest/types'
import { computed } from 'vue'
import ContestProgressBar from '@/components/contest/ContestProgressBar.vue'
import RegisterBtn from '@/components/utils/RegisterBtn.vue'
import { watch } from 'vue'
import { usePlanCapability } from '@/utils/plan/inject'

const props = defineProps<{
  orgId: string
  planId: string
  plan: IPlanDTO
  contests: IPlanContestDTO[]
  contestId: string
}>()

defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
const admin = usePlanCapability('admin')
const currentTab = ref()
const currentContest = computed(
  () =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    props.contests.find(({ _id }) => _id === props.contestId)!
)

const contest = useAsyncState(async () => {
  const resp = await http.get(`contest/${props.contestId}`)
  return resp.json<IContestDTO>()
}, null)

const participant = useAsyncState(async () => {
  const resp = await http.get(`contest/${props.contestId}/self`).json<IContestParticipantDTO>()
  return resp
}, null)

watch(
  () => props.contestId,
  () => {
    contest.execute()
    participant.execute()
  }
)
</script>
