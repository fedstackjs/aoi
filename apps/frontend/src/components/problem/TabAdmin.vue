<template>
  <VCard flat>
    <div class="d-flex flex-row">
      <VTabs v-model="currentTab" direction="vertical" color="primary">
        <VTab value="settings">
          <VIcon start> mdi-cog </VIcon>
          {{ t('settings') }}
        </VTab>
        <VTab value="content">
          <VIcon start>mdi-text</VIcon>
          {{ t('content') }}
        </VTab>
        <VTab value="access">
          <VIcon start> mdi-lock </VIcon>
          {{ t('access') }}
        </VTab>
      </VTabs>
      <VDivider vertical />
      <VWindow v-model="currentTab" class="flex-grow-1">
        <VWindowItem value="content">
          <AdminContent :problem="problem" @updated="emit('updated')" />
        </VWindowItem>
        <VWindowItem value="settings">
          <AdminSettings />
        </VWindowItem>
        <VWindowItem value="access">
          <AdminAccess />
        </VWindowItem>
      </VWindow>
    </div>
  </VCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminContent from './admin/AdminContent.vue'
import AdminSettings from './admin/AdminSettings.vue'
import AdminAccess from './admin/AdminAccess.vue'
import { useI18n } from 'vue-i18n'
import type { IProblemDTO } from './types'

defineProps<{
  problem: IProblemDTO
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()

const currentTab = ref('settings')
</script>

<i18n>
zhHans:
  settings: 设置
  content: 内容
  access: 访问
en:
  settings: Settings
  content: Content
  access: Access
</i18n>
