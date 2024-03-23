<template>
  <VContainer>
    <VRow>
      <VCol>
        <AsyncState :state="contest" hide-when-loading>
          <template v-slot="{ value }">
            <VCard>
              <VCardTitle class="d-flex justify-space-between">
                <div>
                  <p class="text-h4">{{ value.title }}</p>
                  <p class="text-h6 ml-2">{{ value.slug }}</p>
                </div>
                <div class="d-flex flex-column align-end">
                  <VChipGroup class="justify-end">
                    <VChip v-for="tag in value.tags" class="mx-2" :key="tag">
                      {{ tag }}
                    </VChip>
                    <AccessLevelChip :accessLevel="value.accessLevel" />
                  </VChipGroup>
                  <RegisterBtn
                    :endpoint="`contest/${contestId}/register`"
                    :participant="participant"
                    :disabled="!showRegistration"
                  />
                </div>
              </VCardTitle>
              <VDivider />
              <ContestProgressBar :contest="value" @updated="contest.execute()" />
              <VDivider />

              <VTabs>
                <VTab prepend-icon="mdi-book-outline" :to="rel('')" :text="t('tabs.description')" />
                <VTab
                  prepend-icon="mdi-attachment"
                  :to="rel('attachment')"
                  :text="t('tabs.attachments')"
                />
                <VTab
                  v-if="
                    showAdminTab ||
                    (value.currentStage.settings.problemEnabled && participant.state.value)
                  "
                  prepend-icon="mdi-list-box-outline"
                  :to="rel('problem')"
                  :text="t('tabs.problems')"
                />
                <VTab
                  v-if="
                    showAdminTab ||
                    (value.currentStage.settings.solutionEnabled && participant.state.value)
                  "
                  prepend-icon="mdi-timer-sand"
                  :to="rel('solution?userId=' + app.userId)"
                  :text="t('tabs.solutions')"
                />
                <VTab
                  v-if="showAdminTab || value.currentStage.settings.ranklistEnabled"
                  prepend-icon="mdi-chevron-triple-up"
                  :to="rel('ranklist')"
                  :text="t('tabs.ranklist')"
                />
                <VTab
                  v-if="showAdminTab || value.currentStage.settings.participantEnabled"
                  prepend-icon="mdi-account-details-outline"
                  :to="rel('participant')"
                  :text="t('tabs.participant')"
                />
                <VTab
                  prepend-icon="mdi-cog-outline"
                  :to="rel('admin')"
                  v-if="showAdminTab"
                  :text="t('tabs.management')"
                />
              </VTabs>
              <RouterView :contest="value" :problems="problems" @updated="contest.execute()" />
            </VCard>
          </template>
        </AsyncState>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAsyncState } from '@vueuse/core'
import { http } from '@/utils/http'
import AsyncState from '@/components/utils/AsyncState.vue'
import type { IContestParticipantDTO } from '@/components/contest/types'
import AccessLevelChip from '@/components/utils/AccessLevelChip.vue'
import ContestProgressBar from '@/components/contest/ContestProgressBar.vue'
import RegisterBtn from '@/components/utils/RegisterBtn.vue'
import { useContest } from '@/utils/contest/inject'
import { useContestProblemList } from '@/utils/contest/problem/inject'
import { useAppState } from '@/stores/app'

const { t } = useI18n()
const app = useAppState()
const props = defineProps<{
  orgId: string
  contestId: string
}>()

withTitle(computed(() => t('pages.contests')))

const { contest, showRegistration, showAdminTab } = useContest(
  toRef(props, 'orgId'),
  toRef(props, 'contestId')
)

const problems = useContestProblemList(toRef(props, 'contestId'))

const participant = useAsyncState(async () => {
  const resp = await http.get(`contest/${props.contestId}/self`).json<IContestParticipantDTO>()
  return resp
}, null)

const rel = (to: string) => `/org/${props.orgId}/contest/${props.contestId}/${to}`
</script>
