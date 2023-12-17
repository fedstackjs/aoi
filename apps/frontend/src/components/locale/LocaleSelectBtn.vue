<template>
  <VMenu>
    <template v-slot:activator="{ props }">
      <VBtn v-bind="props" icon="mdi-translate" variant="text" />
    </template>
    <VList density="comfortable">
      <VListItem
        v-for="([code, name], i) of supportedLocales"
        :key="i"
        :title="name"
        @click="locale = code"
      />
    </VList>
  </VMenu>
</template>

<script setup lang="ts">
import { attachToLocalStorage } from '@/utils/persist'
import { syncRef } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useLocale } from 'vuetify'
import { supportedLocales } from '@/plugins/i18n'

const { locale } = useI18n({ useScope: 'global' })
const { current } = useLocale()
syncRef(locale, current)
attachToLocalStorage('locale', locale)
</script>
