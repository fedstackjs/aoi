<template>
  <VChip :color="result.color">
    {{ result.curName }}
  </VChip>
  <VChip color="grey" v-if="!result.finished" small class="mx-2">
    {{ result.ttlmsg }}
  </VChip>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t } = useI18n()
const props = defineProps<{
  stages: {
    name: string
    start: number
  }[]
  now: number
}>()

const stageName = (name: string) => {
  return ['upcoming', 'running', 'end'].includes(name) ? t('stages.' + name) : name
}

const getTTLMsg = (rawTTL: number, nextName: string) => {
  // if rawTTL >= 1day, show in days
  // if rawTTL < 1day, show in HH:MM:SS
  const d = Math.floor(rawTTL / 86400000)
  const rest = rawTTL % 86400000
  const h = Math.floor(rest / 3600000)
  const m = Math.floor((rest % 3600000) / 60000)
  const s = Math.floor((rest % 60000) / 1000)
  if (d > 0)
    return (
      d + ' ' + (d > 1 ? t('unit.days') : t('unit.day')) + ' ' + t('left-until') + ' ' + nextName
    )
  else
    return (
      [h, m, s].map((x) => x.toString().padStart(2, '0')).join(':') +
      ' ' +
      t('left-until') +
      ' ' +
      nextName
    )
}

const result = computed(() => {
  // find the current stage
  // stages[i].start <= now < stages[i+1].start
  const n = props.stages.length
  let i = 0
  while (i < n - 1 && props.stages[i + 1].start <= props.now) {
    i++
  }
  const finished = i === n - 1
  const curName = stageName(props.stages[i].name)
  const nextName = finished ? '' : stageName(props.stages[i + 1].name)
  const rawTTL = finished ? 0 : props.stages[i + 1].start - props.now

  return {
    finished: finished,
    curName: curName,
    ttlmsg: getTTLMsg(rawTTL, nextName),
    color: finished ? 'red' : i === 0 ? 'green' : 'blue'
  }
})
</script>

<i18n>
en:
  left-until: left until
  unit:
    days: days
    day: day
zh-Hans:
  left-until: 后进入
  unit:
    days: 天
    day: 天
</i18n>
