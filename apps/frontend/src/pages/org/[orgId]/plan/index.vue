<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard>
          <VCardTitle class="d-flex align-center">
            <div>
              {{ t('pages.plans') }}
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
          <PlanList :orgId="orgId" />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PlanList from '@/components/plan/PlanList.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  orgId: string
}>()

const router = useRouter()
const { t } = useI18n()

withTitle(computed(() => t('pages.plans')))

const search = ref('')

function onSearch() {
  router.push({
    path: `/org/${props.orgId}/plan/search`,
    query: { search: search.value }
  })
}
</script>
