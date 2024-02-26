<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('about-us')">
          <VCardText>
            <a class="u-flex u-flex-col u-items-center" href="https://aoi.fedstack.org">
              <AoiLogo width="128" />
              <q class="u-text-lg u-font-italic">The <b>AOI</b> Project</q>
            </a>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import AoiLogo from '@/components/aoi/AoiLogo.vue'
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

withTitle(computed(() => t('pages.about')))
</script>

<i18n>
en:
  about-us: About This Project
zh-Hans:
  about-us: 关于本项目
</i18n>
