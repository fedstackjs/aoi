<template>
  <VAutocomplete
    v-model="model"
    v-model:search="query"
    :label="label"
    :items="items.state.value"
    :loading="items.isLoading.value"
    item-value="_id"
    item-title="_id"
    no-filter
    v-bind="$attrs"
  >
    <template #item="{ props, item }">
      <VListItem v-bind="props">
        <template #title>
          <VListItemTitle>
            {{ item.raw.title }}
            <span class="text-secondary">{{ item.raw.slug }}</span>
          </VListItemTitle>
        </template>
        <VListItemSubtitle>
          <code>{{ item.raw._id }}</code>
        </VListItemSubtitle>
        <template #append>
          <AccessLevelBadge :access-level="item.raw.accessLevel" />
        </template>
      </VListItem>
    </template>
  </VAutocomplete>
</template>

<script setup lang="ts">
import { useAsyncState, watchDebounced } from '@vueuse/core'
import { ref } from 'vue'

import AccessLevelBadge from './AccessLevelBadge.vue'

import { http } from '@/utils/http'

const props = defineProps<{
  label: string
  endpoint: string
  search?: Record<string, string | number | boolean>
}>()

const model = defineModel<string>({ required: true })
const query = ref('')
let lastQuery = ''

interface Item {
  _id: string
  title: string
  slug: string
  accessLevel: number
}

const items = useAsyncState(async (search: string) => {
  if (!search) return []
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(search)) {
    const item = await http.get(`${props.endpoint}/${search}`).json<Item>()
    return [item]
  }
  const { items } = await http
    .get(props.endpoint, {
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
