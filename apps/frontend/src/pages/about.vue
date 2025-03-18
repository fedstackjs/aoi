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
                AOI V1.3
                <ruby class="text-primary">あさひ <rt>Asahi</rt> </ruby>
              </span>
              <span class="text-secondary">Released under the AGPL-3.0 License</span>
              <span class="text-secondary">2025-03-18</span>
            </a>
          </VCardText>
          <VDivider />
          <VCardText class="d-flex flex-column align-center">
            <h3>History Versions</h3>
            <VTable>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Version</th>
                  <th>Code Name</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2024-12-23</td>
                  <td>1.2.x</td>
                  <td>こみち</td>
                </tr>
                <tr>
                  <td>2024-04-20</td>
                  <td>1.1.x</td>
                  <td>はるひ</td>
                </tr>
                <tr>
                  <td>2024-02-20</td>
                  <td>1.0.x</td>
                  <td>せかい</td>
                </tr>
              </tbody>
            </VTable>
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
