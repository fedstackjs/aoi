<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('pages.admin')">
          <VDivider />
          <div class="d-flex flex-row">
            <VTabs direction="vertical" color="primary">
              <VTab :to="rel('')" exact prepend-icon="mdi-account-box" :text="t('term.profile')" />
              <VTab :to="rel('settings')" prepend-icon="mdi-cog" :text="t('term.settings')" />
              <VTab :to="rel('member')" prepend-icon="mdi-account" :text="t('term.members')" />
              <VTab
                :to="rel('runner')"
                prepend-icon="mdi-server-network"
                :text="t('term.runners')"
              />
              <VTab
                :to="rel('batch-import')"
                prepend-icon="mdi-account-multiple-plus"
                :text="t('term.batch-import')"
              />
            </VTabs>
            <VDivider vertical />
            <RouterView class="flex-grow-1" />
          </div>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  orgId: string
}>()

const { t } = useI18n()

const rel = (to: string) => `/org/${props.orgId}/admin/${to}`
</script>
