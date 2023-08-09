<template>
  <AsyncState :state="problems">
    <template v-slot="{ value }">
      <div class="d-flex flex-row">
        <VTabs direction="vertical" color="primary">
          <VTab prepend-icon="mdi-home" :to="rel('')" exact>
            {{ t('overview') }}
          </VTab>
          <VTab
            v-for="problem of value"
            :key="problem._id"
            prepend-icon="mdi-list-box-outline"
            :to="rel(problem._id)"
            exact
          >
            {{ problem.settings.slug }}.
            {{ problem.title }}
          </VTab>
          <VTab prepend-icon="mdi-plus" :to="rel('new')">
            {{ t('new') }}
          </VTab>
        </VTabs>
        <VDivider vertical />
        <RouterView
          class="flex-grow-1"
          :contest="contest"
          :problems="value"
          @updated="problems.execute()"
        />
      </div>
    </template>
  </AsyncState>
</template>

<script setup lang="ts">
import AsyncState from '@/components/utils/AsyncState.vue'
import type { IContestDTO, IContestProblemListDTO } from '@/components/contest/types'
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()

const { t } = useI18n()

const problems = useAsyncState(async () => {
  const resp = await http.get(`contest/${props.contestId}/problem`)
  console.log(resp)
  const data = await resp.json<IContestProblemListDTO[]>()
  console.log(data)
  return data
}, [])

const rel = (to: string) => `/org/${props.orgId}/contest/${props.contestId}/problem/${to}`
</script>
