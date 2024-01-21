<template>
  <VAlert type="error" :text="t('iaaa-not-supported')" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<i18n>
en:
  iaaa-not-supported: IAAA is not supported for verification.
zh-Hans:
  iaaa-not-supported: IAAA 不支持验证。
</i18n>
