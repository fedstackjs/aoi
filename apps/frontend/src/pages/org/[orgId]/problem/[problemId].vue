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
                  {{ t('problem-description') }}
                </VTab>
                <VTab prepend-icon="mdi-upload-outline" :to="rel('submit')" v-if="value.config">
                  {{ t('problem-submit') }}
                </VTab>
                <VTab prepend-icon="mdi-timer-sand" :to="rel('submission')">
                  {{ t('problem-submissions') }}
                </VTab>
                <VTab prepend-icon="mdi-attachment" :to="rel('attachment')">
                  {{ t('problem-attachments') }}
                </VTab>
                <VTab prepend-icon="mdi-database-outline" :to="rel('data')">
                  {{ t('problem-data') }}
                </VTab>
                <VTab prepend-icon="mdi-cog-outline" :to="rel('admin')">
                  {{ t('problem-management') }}
                </VTab>
              </VTabs>
              <RouterView :problem="value" @updated="problem.execute()" />
            </VCard>
          </template>
        </AsyncState>
      </VCol>
      <VCol cols="3">
        <!-- submission column -->
        <VCard :title="t('submissions')">
          <VTable>
            <thead>
              <tr>
                <th>#</th>
                <th>{{ t('status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sub, key) in subReq.state.value" :key="key">
                <td class="text-blue">{{ sub._id }}</td>
                <td>
                  <VChip :color="stateColor(sub.state)">{{ sub.state }}</VChip>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCard>
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

interface submission {
  _id: string
  state: string
}

const props = defineProps<{
  orgId: string
  problemId: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('problems')))

const subReq = useAsyncState(async () => {
  // TODO : http
  var subList: submission[] = []
  for (var i = 0; i < 5; i++) {
    subList.push({
      _id: '' + i,
      state: i < 4 ? 'WA' : 'AC'
    })
  }
  return subList
}, null as never)

const stateColor = (sta: string) =>
  ({
    AC: 'green',
    WA: 'red'
  })[sta]

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
  problem-submissions: Submission
  submissions: Submissions
  status: Status
zhHans:
  problem-description: 题面
  problem-submit: 提交
  problem-attachments: 附件
  problem-data: 数据
  problem-management: 管理
  problem-submissions: 提交记录
  submissions: 提交记录
  status: 状态
</i18n>
