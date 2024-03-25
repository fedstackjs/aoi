<template>
  <VTextField
    v-model="search"
    hide-details
    class="u-max-w-64"
    density="compact"
    :label="t('term.search')"
    append-icon="mdi-magnify"
    clearable
    @click:append="onSearch"
    @keyup.enter="onSearch"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const props = defineProps<{
  orgId: string
}>()

const router = useRouter()
const { t } = useI18n()

const search = ref('')

function onSearch() {
  router.push({
    path: `/org/${props.orgId}/problem/search`,
    query: { search: search.value }
  })
}

// TODO: check if satisfy the requirement of !CLIENT!
</script>
