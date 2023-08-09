<template>
  <VContainer>
    <VRow>
      <VCol>
        <AsyncState :state="problem">
          <template v-slot="{ value }">
            <VCard>
              <VCardTitle class="d-flex justify-between">
                <div>
                  <p class="text-h4">{{ value.title }}</p>
                  <p class="text-h6 ml-2">{{ value.slug }}</p>
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

              <VTabs>
                <VTab prepend-icon="mdi-book-outline" :to="rel('')">
                  {{ t('description') }}
                </VTab>
                <VTab prepend-icon="mdi-attachment" :to="rel('attachment')">
                  {{ t('attachments') }}
                </VTab>
                <VTab prepend-icon="mdi-list-box" :to="rel('problem')">
                  {{ t('problems') }}
                </VTab>
                <VTab prepend-icon="mdi-chevron-triple-up" :to="rel('ranklist')">
                  {{ t('ranklist') }}
                </VTab>
                <VTab prepend-icon="mdi-cog-outline" :to="rel('admin')">
                  {{ t('management') }}
                </VTab>
              </VTabs>
              <RouterView :contest="value" @updated="problem.execute()" />
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
import type { IContestDTO } from '@/components/contest/types'

const { t } = useI18n()
const props = defineProps<{
  orgId: string
  contestId: string
}>()

withTitle(computed(() => t('contests')))

const problem = useAsyncState(async () => {
  const contestId = props.contestId
  const resp = await http.get(`contest/${contestId}`)
  const data = await resp.json<IContestDTO>()
  if (data.orgId !== props.orgId) throw new Error('orgId not match')
  return data
}, null as never)

const rel = (to: string) => `/org/${props.orgId}/contest/${props.contestId}/${to}`
</script>

<i18n global>
en:
  problem-description: Description
  problem-submit: Submit
  problem-attachments: Attachments
  problem-data: Data
  problem-management: Management
  submissions: Submissions
  status: Status
zhHans:
  problem-description: 题面
  problem-submit: 提交
  problem-attachments: 附件
  problem-data: 数据
  problem-management: 管理
  submissions: 提交记录
  status: 状态
</i18n>
