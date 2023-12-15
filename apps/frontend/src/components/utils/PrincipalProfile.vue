<template>
  <AsyncState :state="profile" hide-when-loading>
    <template v-slot="{ value }">
      <VAvatar>
        <AppGravatar :email="value.email" />
      </VAvatar>
      <code class="u-pl-2">
        <RouterLink v-if="to" :to="to">
          {{ value.name }}
        </RouterLink>
        <span v-else>{{ value.name }}</span>
      </code>
    </template>
  </AsyncState>
</template>

<script setup lang="ts">
import AsyncState from './AsyncState.vue'
import AppGravatar from '../app/AppGravatar.vue'
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'

const props = defineProps<{
  principalId: string
  to?: string
}>()

const profile = useAsyncState(async () => {
  // TODO: implement caching
  let err
  for (const kind of [
    ['user', 'profile_na'],
    ['group', 'profile']
  ]) {
    try {
      const resp = await http.get(`${kind[0]}/${props.principalId}/${kind[1]}`)
      const data = await resp.json<{
        name: string
        email: string
      }>()
      return data
    } catch (_err) {
      err = _err
    }
  }
  throw err
}, null as never)
</script>
