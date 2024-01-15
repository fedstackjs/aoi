<template>
  <VAutocomplete
    v-model="model"
    v-model:search="search"
    density="compact"
    :label="t('term.principal-id')"
    append-icon="mdi-plus"
    :items="items"
    :loading="isLoading"
    no-filter
    return-object
    @click:append="onAppend"
  >
    <template v-slot:item="{ props, item }">
      <VListItem
        v-bind="props"
        :prepend-avatar="item?.raw?.avatar"
        :title="item?.raw?.title"
        :append-icon="appendIcons[item?.raw?.type]"
      ></VListItem>
    </template>
  </VAutocomplete>
</template>

<script setup lang="ts">
import { getAvatarUrl } from '@/utils/avatar'
import { http } from '@/utils/http'
import { useAsyncState, useDebounce } from '@vueuse/core'
import { watch } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'

interface ISearchResultItem {
  principalId: string
  principalType: 'guest' | 'member' | 'group'
  name: string
  emailHash: string
}

interface IPrincipalItem {
  title: string
  value: string
  avatar: string
  type: 'guest' | 'member' | 'group'
}

const { t } = useI18n()
const toast = useToast()

const props = defineProps<{
  orgId: string
}>()
const emits = defineEmits<{
  add: [principalId: string]
}>()

const appendIcons: Record<string, string> = {
  guest: 'mdi-incognito',
  member: 'mdi-account',
  group: 'mdi-account-multiple'
}

const search = ref('')
const model = ref<IPrincipalItem>()
const debouncedSearch = useDebounce(search)
const {
  state: items,
  isLoading,
  execute
} = useAsyncState(
  async () => {
    const isUUID = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(search.value)
    const list = await http
      .post(`org/${props.orgId}/search-principals`, {
        json: {
          [isUUID ? `principalId` : `name`]: search.value
        }
      })
      .json<ISearchResultItem[]>()
    return list.map(
      (item) =>
        ({
          title: item.name,
          value: item.principalId,
          avatar: getAvatarUrl(item.emailHash),
          type: item.principalType
        }) satisfies IPrincipalItem
    )
  },
  [],
  { resetOnExecute: false, immediate: false }
)
watch(debouncedSearch, () => execute())

function onAppend() {
  if (model.value) {
    emits('add', model.value.value)
    model.value = undefined
    search.value = ''
  } else {
    toast.warning(`Please select principal first!`)
  }
}
</script>
