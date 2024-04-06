<template>
  <VContainer fluid>
    <AsyncState :state="contest" hide-when-loading>
      <template v-slot="{ value }">
        <VRow>
          <VCol>
            <VCard variant="text">
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
              <ContestProgressBar :contest="value" @updated="contest.execute()" />
            </VCard>
          </VCol>
        </VRow>
        <VRow>
          <VCol>
            <RouterView :contest="value" :problems="problems" @updated="contest.execute()" />
          </VCol>
        </VRow>
      </template>
    </AsyncState>
  </VContainer>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { computed, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import ContestProgressBar from '@/components/contest/ContestProgressBar.vue'
import ContestTabs from '@/components/contest/ContestTabs.vue'
import type { IContestParticipantDTO } from '@/components/contest/types'
import AccessLevelChip from '@/components/utils/AccessLevelChip.vue'
import AsyncState from '@/components/utils/AsyncState.vue'
import RegisterBtn from '@/components/utils/RegisterBtn.vue'
import { useContest } from '@/utils/contest/inject'
import { useContestProblemList } from '@/utils/contest/problem/inject'
import { http } from '@/utils/http'
import { withNavExtension, withTitle } from '@/utils/title'

const props = defineProps<{
  orgId: string
  contestId: string
}>()

const { t } = useI18n()

const { contest, showRegistration, showAdminTab } = useContest(
  toRef(props, 'orgId'),
  toRef(props, 'contestId')
)

withTitle(computed(() => contest.state.value?.title ?? t('pages.contests')))

const problems = useContestProblemList(toRef(props, 'contestId'))

const participant = useAsyncState(async () => {
  const resp = await http.get(`contest/${props.contestId}/self`).json<IContestParticipantDTO>()
  return resp
}, null)

withNavExtension(
  ContestTabs,
  computed(() => ({
    orgId: props.orgId,
    contestId: props.contestId,
    showAdminTab: showAdminTab.value,
    registered: !!participant.state.value,
    contest: contest.state.value
  }))
)

const rel = (to: string) => `/org/${props.orgId}/contest/${props.contestId}/${to}`
</script>
