<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('new-organization')">
          <VCardText>
            <VTextField v-model="profile.name" :label="t('term.name')" />
            <VTextField v-model="profile.email" :label="t('term.email')" />
          </VCardText>
          <VCardActions>
            <VBtn color="primary" variant="elevated" @click="create">{{ t('action.create') }}</VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { http } from '@/utils/http'
import { withTitle } from '@/utils/title'

const router = useRouter()
const { t } = useI18n()
const profile = reactive({
  name: '',
  email: ''
})

withTitle(computed(() => t('new-organization')))

async function create() {
  const resp = await http.post('org', { json: { profile } })
  const data = await resp.json<{ orgId: string }>()
  router.push(`/org/${data.orgId}`)
}
</script>
