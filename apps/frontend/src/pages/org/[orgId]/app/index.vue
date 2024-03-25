<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard>
          <VCardTitle class="d-flex align-center">
            <div>
              {{ t('pages.apps') }}
            </div>
            <VSpacer />
            <VTextField
              v-model="search"
              class="u-max-w-64"
              density="compact"
              :label="t('term.search')"
              append-icon="mdi-magnify"
              clearable
              @click:append="onSearch"
              @keyup.enter="onSearch"
            />
          </VCardTitle>
          <AppList :orgId="orgId" />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import AppList from '@/components/app/AppList.vue'
import { withI18nTitle } from '@/utils/title'

const props = defineProps<{
  orgId: string
}>()

const router = useRouter()
const { t } = useI18n()

withI18nTitle('pages.apps')

const search = ref('')

function onSearch() {
  router.push({
    path: `/org/${props.orgId}/app/search`,
    query: { search: search.value }
  })
}
</script>
