<template>
  <VContainer>
    <VRow>
      <VCol>
        <!-- main column -->
        <AsyncState :state="problem">
          <template v-slot="{ value }">
            <MainView :problem="value" @updated="problem.execute()" />
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
import { useRoute } from 'vue-router'
import AsyncState from '@/components/utils/AsyncState.vue'
import type { IProblemDTO } from '@/components/problem/types'
import MainView from '@/components/problem/MainView.vue'

interface submission {
  _id: string
  state: string
}

const { t } = useI18n()
const route = useRoute()

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
  const problemId = route.params.problemId
  const resp = await http.get(`problem/${problemId}`)
  return resp.json<IProblemDTO>()
}, null as never)
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
