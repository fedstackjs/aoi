<template>
  <VCard variant="flat">
    <SettingsEditor :endpoint="`org/${props.orgId}/admin/profile`">
      <template v-slot="scoped">
        <AdminSettingsInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
  </VCard>
</template>

<script setup lang="ts">
import AdminSettingsInput from '@/components/admin/AdminSettingsInput.vue'
import SettingsEditor from '@/components/utils/SettingsEditor.vue'
import { useI18n } from 'vue-i18n'
import { withTitle } from '@/utils/title'

const props = defineProps<{ orgId: string }>()
const { t } = useI18n()

withTitle(t('pages.admin'))
</script>
