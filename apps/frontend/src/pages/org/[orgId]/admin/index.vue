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

const props = defineProps<{ orgId: string }>()
</script>
