<template>
  <VApp>
    <AoiBar />
    <AoiNavDrawer />
    <VMain>
      <RouterView />
    </VMain>
    <AoiFooter />
    <VDialog v-model="hasIssue" max-width="640">
      <VCard>
        <VAlert :title="t('msg.platform-issue-detected')" type="warning">
          <I18nT keypath="msg.platform-issue-detected-detail">
            <template #issues>
              <ul>
                <li v-for="(issue, i) in issues" :key="i">
                  <b>{{ t(`platform-issue.${issue}`) }}</b>
                </li>
              </ul>
            </template>
          </I18nT>
        </VAlert>
        <VDivider />
        <VCardTitle class="text-center">{{ t('msg.recommended-browsers') }}</VCardTitle>
        <VCardText class="pt-0">
          <VRow no-gutters>
            <VCol v-for="(browser, i) in browsers" :key="i" cols="6" sm="3" class="pa-1">
              <VBtn
                :href="browser.href"
                :text="browser.name"
                :prepend-icon="browser.icon"
                :color="browser.color"
                size="large"
                variant="tonal"
                rounded="sm"
                target="_blank"
                rel="noopener noreferrer"
                block
              />
            </VCol>
          </VRow>
        </VCardText>
        <VDivider />
        <VCardActions>
          <VBtn block :text="t('action.dismiss')" color="error" @click="ignore" />
        </VCardActions>
      </VCard>
    </VDialog>
  </VApp>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AoiBar from '@/components/aoi/AoiBar.vue'
import AoiNavDrawer from '@/components/aoi/AoiNavDrawer.vue'
import AoiFooter from '@/components/aoi/AoiFooter.vue'
import { usePlatformIssues, useRecommendedBrowsers } from '@/utils/platform'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { issues, hasIssue, ignore } = usePlatformIssues()
const browsers = useRecommendedBrowsers()
</script>
