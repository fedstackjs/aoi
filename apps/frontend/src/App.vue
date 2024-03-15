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
          <div class="u-grid u-grid-flow-col u-grid-rows-1 u-grid-cols-subgrid u-gap-2">
            <VBtn
              v-for="(browser, i) in browsers"
              :key="i"
              :href="browser.href"
              :prepend-icon="browser.icon"
              :color="browser.color"
              size="large"
              variant="outlined"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ browser.name }}
            </VBtn>
          </div>
        </VCardText>
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
const { issues, hasIssue } = usePlatformIssues()
const browsers = useRecommendedBrowsers()
</script>
