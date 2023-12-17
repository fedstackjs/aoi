<template>
  <div class="u-grid u-grid-cols-2">
    <VCheckbox v-model="model.registrationEnabled" :label="t('registration-enabled')" />
    <VCheckbox v-model="model.registrationAllowPublic" :label="t('registration-allow-public')" />
    <VCheckbox v-model="model.promotion" :label="t('promotion')" />
  </div>
</template>

<script setup lang="ts">
import type { IPlanSettings } from '@/types'
import { useI18n } from 'vue-i18n'

const model = defineModel<IPlanSettings>({ required: true })
const { t } = useI18n()
</script>
<i18n>
en:
  registration-enabled: Registration Enabled
  registration-allow-public: Allow Public Registration
  promotion: Demonstrate on Homepage
zh-Hans:
  registration-enabled: 允许注册
  registration-allow-public: 允许公开注册
  promotion: 在主页展示
</i18n>
