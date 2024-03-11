<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard>
          <VCardTitle class="d-flex align-center u-gap-2">
            <div>
              {{ t('pages.problems') }}
            </div>
            <VSpacer />
            <CommonTagDialog
              endpoint="problem/tags"
              :target="`/org/${orgId}/problem/tag/:tag`"
              :query="{ orgId }"
            />
            <VTextField
              v-model="search"
              class="u-max-w-64"
              density="compact"
              :label="t('term.search')"
              append-icon="mdi-magnify"
              hide-details
              clearable
              @click:append="onSearch"
              @keyup.enter="onSearch"
            />
          </VCardTitle>
          <ProblemList :orgId="orgId" />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProblemList from '@/components/problem/ProblemList.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CommonTagDialog from '@/components/common/CommonTagDialog.vue'

const props = defineProps<{
  orgId: string
}>()

const router = useRouter()
const { t } = useI18n()

withTitle(computed(() => t('pages.problems')))

const search = ref('')

function onSearch() {
  router.push({
    path: `/org/${props.orgId}/problem/search`,
    query: { search: search.value }
  })
}
</script>
