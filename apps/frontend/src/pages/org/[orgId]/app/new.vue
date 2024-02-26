<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('new-app')">
          <VCardText>
            <VTextField v-model="payload.title" :label="t('term.title')" />
            <VTextField v-model="payload.slug" :label="t('term.slug')" />
            <AccessLevelInput v-model="payload.accessLevel" />
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
import AccessLevelInput from '@/components/utils/AccessLevelInput.vue'
import { http } from '@/utils/http'
import { withTitle } from '@/utils/title'
import { reactive } from 'vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const props = defineProps<{
  orgId: string
}>()

const { t } = useI18n()
const toast = useToast()
const router = useRouter()

withTitle(computed(() => t('new-app')))

const payload = reactive({
  slug: '',
  title: '',
  accessLevel: 0
})

async function create() {
  const { orgId } = props
  const resp = await http.post(`app`, {
    json: {
      ...payload,
      orgId
    }
  })
  const { appId } = await resp.json<{ appId: string }>()
  toast.success(t('success'))
  router.replace(`/org/${orgId}/app/${appId}`)
}
</script>
