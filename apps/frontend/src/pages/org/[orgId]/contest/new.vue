<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('new-contest')">
          <VCardText>
            <VTextField v-model="payload.title" :label="t('term.title')" />
            <VTextField v-model="payload.slug" :label="t('term.slug')" />
            <VRadioGroup inline v-model="payload.accessLevel" :label="t('auth.access-level')">
              <VRadio :value="0" :label="t('auth.public')"></VRadio>
              <VRadio :value="1" :label="t('auth.restricted')"></VRadio>
              <VRadio :value="2" :label="t('auth.private')"></VRadio>
            </VRadioGroup>
            <VTextField
              v-model="payload.start"
              :label="t('term.start-time')"
              type="datetime-local"
            />
            <VTextField v-model="payload.end" :label="t('term.end-time')" type="datetime-local" />
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
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import { noMessage, useAsyncTask } from '@/utils/async'
import { enableSlugFinder } from '@/utils/flags'
import { http } from '@/utils/http'
import { findNextSlug } from '@/utils/slug'
import { withTitle } from '@/utils/title'

const props = defineProps<{
  orgId: string
}>()

const { t } = useI18n()
const toast = useToast()
const router = useRouter()

withTitle(computed(() => t('new-contest')))

const payload = reactive({
  slug: '',
  title: '',
  accessLevel: 0,
  start: '',
  end: ''
})

async function create() {
  const { start: _start, end: _end, ...rest } = payload
  const start = +new Date(_start)
  if (Number.isNaN(start)) return toast.error('Invalid start time')
  const end = +new Date(_end)
  if (Number.isNaN(end) || end <= start) return toast.error('Invalid end time')
  const duration = end - start
  const { orgId } = props
  const resp = await http.post(`contest`, {
    json: {
      ...rest,
      orgId,
      start,
      duration
    }
  })
  const { contestId } = await resp.json<{ contestId: string }>()
  router.replace(`/org/${orgId}/contest/${contestId}`)
}

const findSlug = useAsyncTask(async () => {
  payload.slug = await findNextSlug('contest', props.orgId, (n) => `${n}`.padStart(4, '0'))
  return noMessage()
})
</script>
