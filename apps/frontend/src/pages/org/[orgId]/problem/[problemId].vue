<template>
  <VContainer>
    <VRow>
      <VCol>
        <!-- main column -->
        <AsyncState :state="problem">
          <template v-slot="{ value }">
            <VCard>
              <VCardTitle class="d-flex justify-space-between">
                <div>
                  <p class="text-h4">{{ value.title }}</p>
                  <p class="text-h6 ml-2">{{ value.slug }}</p>
                </div>
                <div>
                  <VChipGroup class="justify-end">
                    <VChip v-for="tag in value.tags" class="mx-2" :key="tag">
                      {{ tag }}
                    </VChip>
                    <AccessLevelChip :accessLevel="value.accessLevel" />
                  </VChipGroup>
                </div>
              </VCardTitle>
              <VDivider />

              <VTabs>
                <VTab prepend-icon="mdi-book-outline" :to="rel('')">
                  {{ t('tabs.problem-description') }}
                </VTab>
                <VTab prepend-icon="mdi-upload-outline" :to="rel('submit')" v-if="value.config">
                  {{ t('tabs.submit') }}
                </VTab>
                <VTab prepend-icon="mdi-timer-sand" :to="rel('solution')">
                  {{ t('tabs.solutions') }}
                </VTab>
                <VTab prepend-icon="mdi-attachment" :to="rel('attachment')">
                  {{ t('tabs.attachments') }}
                </VTab>
                <VTab prepend-icon="mdi-database-outline" :to="rel('data')">
                  {{ t('tabs.data') }}
                </VTab>
                <VTab prepend-icon="mdi-cog-outline" :to="rel('admin')">
                  {{ t('tabs.management') }}
                </VTab>
              </VTabs>
              <RouterView :problem="value" @updated="problem.execute()" />
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
import AccessLevelChip from '@/components/utils/AccessLevelChip.vue'
import type { IProblemDTO } from '@/components/problem/types'

const props = defineProps<{
  orgId: string
  problemId: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.problems')))

const problem = useAsyncState(async () => {
  const problemId = props.problemId
  const resp = await http.get(`problem/${problemId}`)
  const data = await resp.json<IProblemDTO>()
  if (data.orgId !== props.orgId) throw new Error('Bad request')
  return data
}, null as never)

const rel = (to: string) => `/org/${props.orgId}/problem/${props.problemId}/${to}`
</script>

<i18n global>
en:
  problem-description: Description
  problem-submit: Submit
  problem-attachments: Attachments
  problem-data: Data
  problem-management: Management
  problem-solutions: solution
  solutions: solutions
  status: Status
zhHans:
  problem-description: 题面
  problem-submit: 提交
  problem-attachments: 附件
  problem-data: 数据
  problem-management: 管理
  problem-solutions: 提交记录
  solutions: 提交记录
  status: 状态
</i18n>
