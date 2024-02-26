<template>
  <VFooter app absolute>
    <VRow no-gutters>
      <VCol cols="12" class="text-center" v-if="extraFooterText">
        <span>{{ extraFooterText }}</span>
      </VCol>
      <VCol cols="12" class="text-center text-caption u-opacity-70">
        <I18nT keypath="powered-by">
          <template #product>
            <a href="https://aoi.fedstack.org">{{ t('product') }}</a>
          </template>
        </I18nT>
      </VCol>
    </VRow>
  </VFooter>
</template>

<script setup lang="ts">
import { extraFooterText } from '@/utils/flags'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<i18n>
en:
  product: 'The AOI Project'
  powered-by: 'Powered by {product}'
zh-Hans:
  product: 'AOI 项目'
  powered-by: '由 {product} 提供支持'
</i18n>
