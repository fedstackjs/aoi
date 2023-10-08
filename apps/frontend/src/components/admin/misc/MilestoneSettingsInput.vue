<template>
  <VTextField v-model="model.csp" :label="t('misc-csp')" :rules="dateRules" />
  <VTextField v-model="model.noip" :label="t('misc-noip')" :rules="dateRules" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const model = defineModel<{ csp: string; noip: string }>({ required: true })
const { t } = useI18n()

const dateRules = [
  (s: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(s)) {
      return t('misc-date-format')
    }
    const d = new Date(s)
    if (d.toString() === 'Invalid Date') {
      return t('misc-date-invalid')
    }
    if (d.getTime() < Date.now()) {
      return t('misc-date-past')
    }
    return true
  }
]
</script>

<i18n>
en:
  misc-date-format: Date format should be YYYY-MM-DD
  misc-date-invalid: Invalid date
  misc-date-past: Date should not be in the past
  misc-csp: CSP Date
  misc-noip: NOIP Date
zh-Hans:
  misc-date-format: 日期格式应为 YYYY-MM-DD
  misc-date-invalid: 无效的日期
  misc-date-past: 日期不能在过去
  misc-csp: CSP 日期
  misc-noip: NOIP 日期
</i18n>
