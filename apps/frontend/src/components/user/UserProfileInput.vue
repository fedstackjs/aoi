<template>
  <VTextField v-model="model.name" :label="t('term.name')" type="string" />
  <VTextField v-model="model.email" :label="t('term.email')" type="string" />
  <VTextField v-model="model.realname" :label="t('term.realname')" type="string" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const model = defineModel<{
  name: string
  email: string
  realname: string
}>({ required: true })
</script>
