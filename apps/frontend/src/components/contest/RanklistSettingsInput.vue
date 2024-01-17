<template>
  <VTextField v-model.number="model.showBefore" :label="t('common.show-before')" type="number" />
  <VTextField v-model.number="model.showAfter" :label="t('common.show-after')" type="number" />
  <VTextarea
    v-model="model.config"
    :label="t('ranklist-config')"
    :placeholder="t('ranklist-config-placeholder')"
    append-icon="mdi-delete"
    class="u-font-mono"
    @click:append="model.config = undefined"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const model = defineModel<{
  showBefore: number
  showAfter: number
  config?: string
}>({ required: true })
</script>

<i18n>
en:
  ranklist-config: Ranklist Config
  ranklist-config-placeholder: Please refer to the documentation for the configuration format
zh-Hans:
  ranklist-config: 排行榜配置
  ranklist-config-placeholder: 请参考文档查看配置格式
</i18n>
