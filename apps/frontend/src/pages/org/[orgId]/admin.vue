<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('pages.admin')">
          <VDivider />
          <div class="d-flex flex-row">
            <VTabs direction="vertical" color="primary">
              <VTab :to="rel('')" exact>
                <VIcon start> mdi-account-box </VIcon>
                {{ t('term.profile') }}
              </VTab>
              <VTab :to="rel('settings')">
                <VIcon start> mdi-cog </VIcon>
                {{ t('term.settings') }}
              </VTab>
              <VTab :to="rel('member')">
                <VIcon start> mdi-account </VIcon>
                {{ t('term.members') }}
              </VTab>
              <VTab :to="rel('runner')">
                <VIcon start> mdi-account </VIcon>
                {{ t('term.runners') }}
              </VTab>
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
