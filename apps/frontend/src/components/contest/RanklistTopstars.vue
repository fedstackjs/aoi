<template>
  <AsyncState :state="option">
    <template #default="{ value }">
      <VChart class="u-h-64" :option="value" autoresize />
    </template>
  </AsyncState>
</template>

<script setup lang="ts">
import type { RanklistTopstar } from '@aoi-js/common'
import { useAsyncState } from '@vueuse/core'
import { LineChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { watch } from 'vue'
import VChart from 'vue-echarts'

import AsyncState from '../utils/AsyncState.vue'

import { useContestData } from '@/utils/contest/inject'
import { getProfile } from '@/utils/profile'

const props = defineProps<{
  topstar: RanklistTopstar
}>()

use([CanvasRenderer, LineChart, TooltipComponent, LegendComponent, GridComponent])

const contest = useContestData()

const option = useAsyncState(async () => {
  const maxTs = props.topstar.list.reduce((max, item) => {
    const ts = item.mutations[item.mutations.length - 1].ts
    return Math.max(max, ts)
  }, 0)
  const now = Math.max(
    maxTs,
    Math.min(Date.now(), contest.value.stages[contest.value.stages.length - 1].start)
  )
  const profiles = await Promise.all(props.topstar.list.map((item) => getProfile(item.userId)))
  const map = Object.fromEntries(
    props.topstar.list.map((item, index) => [item.userId, profiles[index]])
  )
  return {
    tooltip: {
      trigger: 'item',
      formatter: (data: { value: number[]; seriesName: string }) => {
        const ts = new Date(data.value[0]).toLocaleString()
        const name = map[data.seriesName].name
        return `${name} ${data.value[1]} ${ts}`
      }
    },
    xAxis: {
      type: 'time'
    },
    yAxis: {
      type: 'value'
    },
    series: props.topstar.list.map((item) => {
      const finalScore = item.mutations[item.mutations.length - 1].score
      return {
        data: [...item.mutations.map((mut) => [mut.ts, mut.score]), [now, finalScore]],
        type: 'line',
        name: item.userId,
        endLabel: {
          show: true,
          formatter: () => {
            return map[item.userId].name + ': ' + finalScore
          }
        }
      }
    }),
    legend: {
      data: props.topstar.list.map((item) => item.userId),
      formatter: (name: string) => map[name].name
    }
  }
}, null)

watch(
  () => props.topstar,
  () => option.execute(),
  { deep: true }
)
</script>
