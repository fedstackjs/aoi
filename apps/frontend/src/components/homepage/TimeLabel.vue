<template>
  <VChip variant="text" class="text-h6 mx-2">
    {{ todayStr }}
  </VChip>
  <VChip variant="tonal" color="red" class="mx-2">
    距CSP {{ milestone.state.value?.csp }} 天
  </VChip>
  <VChip variant="tonal" color="orange-darken-1" class="mx-2">
    距NOIP {{ milestone.state.value?.noip }} 天
  </VChip>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { ref } from 'vue'

import { http } from '@/utils/http'

const today = new Date()
const todayStr = ref(today.toLocaleDateString())

const milestone = useAsyncState(async () => {
  const resp = await http.get('info/milestone')
  const { csp, noip } = await resp.json<{
    csp: string
    noip: string
  }>()
  const cspDate = new Date(csp)
  const noipDate = new Date(noip)
  const getDay = (d: Date) => {
    return Math.floor(d.getTime() / 86400000)
  }
  console.log(csp, noip, cspDate, noipDate, getDay(cspDate), getDay(noipDate), getDay(today))
  return {
    csp: getDay(cspDate) - getDay(today),
    noip: getDay(noipDate) - getDay(today)
  }
}, null as never)
</script>
