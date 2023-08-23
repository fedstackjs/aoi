<template>
  <div class="u-grid u-grid-cols-2">
    <VCheckbox
      v-model="model.registrationEnabled"
      :label="t('plan.settings.registration-enabled')"
    />
    <VCheckbox
      v-model="model.registrationAllowPublic"
      :label="t('plan.settings.registration-allow-public')"
    />
  </div>
</template>

<script setup lang="ts">
import type { IPlanSettings } from '@/types'
import { useI18n } from 'vue-i18n'

const model = defineModel<IPlanSettings>({ required: true })
const { t } = useI18n()
</script>
