<template>
  <VAutocomplete
    v-model.trim="model"
    v-model:search="query"
    :items="items.state.value"
    :loading="items.isLoading.value"
    item-value="_id"
    item-title="_id"
    no-filter
    v-bind="$attrs"
  >
    <template #item="{ props, item }">
      <VListItem v-bind="props">
        <template #prepend>
          <VAvatar>
            <AoiGravatar :email="item.raw.emailHash" />
          </VAvatar>
        </template>
        <template #title>
          <VListItemTitle>
            {{ item.raw.name }}
          </VListItemTitle>
        </template>
        <VListItemSubtitle>
          <code>{{ item.raw._id }}</code>
        </VListItemSubtitle>
      </VListItem>
    </template>
  </VAutocomplete>
</template>

<script setup lang="ts">
import { useAsyncState, watchDebounced } from '@vueuse/core'
import { ref } from 'vue'

import AoiGravatar from '../aoi/AoiGravatar.vue'

import { useAppState } from '@/stores/app'
import { http } from '@/utils/http'
import { getProfile } from '@/utils/profile'

const props = defineProps<{
  search?: Record<string, string | number | boolean>
}>()

const model = defineModel<string>({ required: true })
const app = useAppState()
const query = ref('')
let lastQuery = ''

interface Item {
  _id: string
  name: string
  emailHash: string
  namespace?: string
  tags?: string[]
}

const items = useAsyncState(async (search: string) => {
  if (!search) return []
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(search)) {
    const item = await getProfile(search)
    if (item && item.principalType === 'user')
      return [
        {
          _id: item.principalId,
          name: item.name,
          emailHash: item.emailHash,
          namespace: item.namespace,
          tags: item.tags
        }
      ]
    return []
  }
  if (!app.loggedIn) return []
  const { items } = await http
    .get(`user`, {
      searchParams: {
        ...props.search,
        search,
        perPage: 15,
        page: 1
      }
    })
    .json<{ items: Item[] }>()
  return items
}, [])

watchDebounced(
  () => query.value,
  (cur) => cur && (cur === lastQuery || items.execute(0, (lastQuery = cur))),
  { debounce: 500 }
)
</script>
