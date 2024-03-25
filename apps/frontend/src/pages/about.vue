<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('about-us')">
          <VCardText>
            <a class="u-flex u-flex-col u-items-center" href="https://aoi.fedstack.org">
              <AoiLogo width="128" />
              <q class="u-text-2xl u-font-italic">The <b>AOI</b> Project</q>
              <span class="text-black u-text-xl">
                AOI V1.0
                <ruby class="text-primary">せかい <rt>Sekai</rt> </ruby>
              </span>
              <span class="text-secondary">Released under the AGPL-3.0 License</span>
              <span class="text-secondary">2024-02-20</span>
            </a>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import AoiLogo from '@/components/aoi/AoiLogo.vue'
import { withTitle } from '@/utils/title'

const { t } = useI18n()

withTitle(computed(() => t('pages.about')))
</script>

<i18n>
en:
  about-us: About This Project
zh-Hans:
  about-us: 关于本项目
</i18n>
