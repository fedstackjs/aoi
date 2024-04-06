<template>
  <VTextField
    v-if="route.params.orgId"
    v-model="search"
    hide-details
    class="u-max-w-64"
    density="compact"
    :label="t('term.search')"
    append-inner-icon="mdi-magnify"
    clearable
    @click:append-inner="onSearch"
    @keyup.enter="onSearch"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const search = ref('')

function onSearch() {
  if (search.value && route.params.orgId) {
    router.push({
      path: `/org/${route.params.orgId}/problem/search`,
      query: { search: search.value }
    })
  }
}
</script>
