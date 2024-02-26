<template>
  <VCard flat :title="t('term.settings')">
    <VDivider />
    <SettingsEditor :endpoint="`app/${appId}/admin/settings`">
      <template v-slot="scoped">
        <AppSettingsInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
    <VDivider />
    <AccessLevelEditor
      :access-level="app.accessLevel"
      :prefix="`app/${appId}/admin/accessLevel`"
      @updated="emit('updated')"
    />
    <VDivider />
    <VCardSubtitle>
      {{ t('app-secret') }}
    </VCardSubtitle>
    <VCardText>
      <VTextField
        :model-value="appSecret.state.value"
        readonly
        class="u-font-mono"
        append-icon="mdi-refresh"
        @click:append="appSecret.execute()"
      />
    </VCardText>
    <VCardSubtitle>
      {{ t('term.danger-zone') }}
    </VCardSubtitle>
    <VCardActions>
      <VBtn color="red" variant="elevated" @click="deleteApp()">
        {{ t('action.delete') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import AppSettingsInput from '@/components/app/AppSettingsInput.vue'
import AccessLevelEditor from '@/components/utils/AccessLevelEditor.vue'
import SettingsEditor from '@/components/utils/SettingsEditor.vue'
import { useI18n } from 'vue-i18n'
import { http } from '@/utils/http'
import { useRouter } from 'vue-router'
import { useAppData } from '@/utils/app/inject'
import { useAsyncState } from '@vueuse/core'

const props = defineProps<{
  orgId: string
  appId: string
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
const router = useRouter()
const app = useAppData()

const appSecret = useAsyncState(
  async () => {
    const { secret } = await http
      .post(`app/${props.appId}/admin/revoke-secret`)
      .json<{ secret: string }>()
    return secret
  },
  '',
  { immediate: false }
)

async function deleteApp() {
  await http.delete(`app/${props.appId}/admin`)
  router.push(`/org/${props.orgId}/app`)
  emit('updated')
}
</script>

<i18n>
en:
  app-secret: App Secret

zh-Hans:
  app-secret: 应用密钥
</i18n>
