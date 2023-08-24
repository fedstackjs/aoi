<template>
  <VContainer>
    <VRow>
      <VCol>
        <AsyncState :state="contest">
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
                  />
                </div>
              </VCardTitle>
              <VDivider />
              <ContestProgressBar :contest="value" @updated="contest.execute()" />
              <VDivider />

              <VTabs>
                <VTab prepend-icon="mdi-book-outline" :to="rel('')">
                  {{ t('tabs.description') }}
                </VTab>
                <VTab prepend-icon="mdi-attachment" :to="rel('attachment')">
                  {{ t('tabs.attachments') }}
                </VTab>
                <VTab prepend-icon="mdi-list-box" :to="rel('problem')">
                  {{ t('tabs.problems') }}
                </VTab>
                <VTab prepend-icon="mdi-timer-sand" :to="rel('solution')">
                  {{ t('tabs.solutions') }}
                </VTab>
                <VTab prepend-icon="mdi-chevron-triple-up" :to="rel('ranklist')">
                  {{ t('tabs.ranklist') }}
                </VTab>
                <VTab prepend-icon="mdi-cog-outline" :to="rel('admin')">
                  {{ t('tabs.management') }}
                </VTab>
              </VTabs>
              <RouterView :contest="value" @updated="contest.execute()" />
            </VCard>
          </template>
        </AsyncState>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAsyncState } from '@vueuse/core'
import { http } from '@/utils/http'
import AsyncState from '@/components/utils/AsyncState.vue'
import type { IContestDTO, IContestParticipantDTO } from '@/components/contest/types'
import AccessLevelChip from '@/components/utils/AccessLevelChip.vue'
import ContestProgressBar from '@/components/contest/ContestProgressBar.vue'
import RegisterBtn from '@/components/utils/RegisterBtn.vue'

const { t } = useI18n()
const props = defineProps<{
  orgId: string
  contestId: string
}>()

withTitle(computed(() => t('pages.contests')))

const contest = useAsyncState(async () => {
  const contestId = props.contestId
  const resp = await http.get(`contest/${contestId}`)
  const data = await resp.json<IContestDTO>()
  if (data.orgId !== props.orgId) throw new Error('orgId not match')
  return data
}, null as never)

const participant = useAsyncState(async () => {
  const resp = await http.get(`contest/${props.contestId}/self`).json<IContestParticipantDTO>()
  return resp
}, null)

const rel = (to: string) => `/org/${props.orgId}/contest/${props.contestId}/${to}`
</script>
