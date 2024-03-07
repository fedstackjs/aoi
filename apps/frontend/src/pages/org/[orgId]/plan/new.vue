<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('new-plan')">
          <VCardText>
            <VTextField v-model="payload.title" :label="t('term.title')" />
            <VTextField v-model="payload.slug" :label="t('term.slug')" />
            <AccessLevelInput v-model="payload.accessLevel" />
          </VCardText>
          <VCardActions>
            <VBtn
              v-if="enableSlugFinder"
              color="info"
              variant="elevated"
              :loading="findSlug.isLoading.value"
              @click="findSlug.execute()"
            >
              {{ t('action.generate-slug') }}
            </VBtn>
            <VBtn color="primary" variant="elevated" @click="create">{{ t('action.create') }}</VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { noMessage, useAsyncTask } from '@/utils/async'
import { http } from '@/utils/http'
import { findNextSlug } from '@/utils/slug'
import { withTitle } from '@/utils/title'
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { enableSlugFinder } from '@/utils/flags'

const props = defineProps<{
  orgId: string
}>()

const { t } = useI18n()
const toast = useToast()
const router = useRouter()

withTitle(computed(() => t('new-plan')))

const payload = reactive({
  slug: '',
  title: '',
  accessLevel: 0
})

async function create() {
  const { orgId } = props
  const resp = await http.post(`plan`, {
    json: {
      ...payload,
      orgId
    }
  })
  const { planId } = await resp.json<{ planId: string }>()
  toast.success(t('success'))
  router.replace(`/org/${orgId}/plan/${planId}`)
}

const findSlug = useAsyncTask(async () => {
  payload.slug = await findNextSlug('plan', props.orgId, (n) => `${n}`.padStart(4, '0'))
  return noMessage()
})
</script>
