<template>
  <VCard variant="flat">
    <template v-if="currentContest">
      <VCardTitle class="d-flex justify-space-between">
        <div>
          <p class="text-h4">{{ currentContest.title }}</p>
        </div>
        <div>
          <VChipGroup class="justify-end">
            <VChip v-for="tag in currentContest.tags" class="mx-2" :key="tag">
              {{ tag }}
            </VChip>
          </VChipGroup>
          <VBtn
            v-if="participant.state.value"
            variant="tonal"
            prepend-icon="mdi-arrow-top-left"
            :to="`/org/${orgId}/contest/${contestId}`"
          >
            <I18nT keypath="action.goto">
              <template #page>
                {{ t('corresponding-contest') }}
              </template>
            </I18nT>
          </VBtn>
          <RegisterBtn
            v-else
            :endpoint="`plan/${planId}/contest/${contestId}/register`"
            :participant="participant"
          />
        </div>
      </VCardTitle>
      <VDivider />
      <ContestProgressBar :contest="currentContest" />
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
            <MarkdownRenderer :md="currentContest.description" class="pa-4" />
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
    <template v-else>
      <VCardText>
        <VAlert type="error" :text="t('msg.not-found')" />
      </VCardText>
    </template>
  </VCard>
</template>

<script setup lang="ts">
import MarkdownRenderer from '@/components/utils/MarkdownRenderer.vue'
import type { IPlanDTO, IPlanContestDTO } from '@/components/plan/types'
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import ContestTabAdmin from '@/components/plan/ContestTabAdmin.vue'
import type { IContestParticipantDTO } from '@/components/contest/types'
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

const participant = useAsyncState(async () => {
  const resp = await http.get(`contest/${props.contestId}/self`).json<IContestParticipantDTO>()
  return resp
}, null)

watch(
  () => props.contestId,
  () => participant.execute()
)
</script>

<i18n>
en:
  corresponding-contest: Corresponding contest

zh-Hans:
  corresponding-contest: 对应比赛或题单
</i18n>
