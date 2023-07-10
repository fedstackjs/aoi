<template>
  <VMenu>
    <template v-slot:activator="{ props }">
      <VBtn v-bind="props" icon="mdi-translate" variant="text" />
    </template>
    <VList density="comfortable">
      <VListItem
        v-for="(item, i) of availableLocales"
        :key="i"
        :title="'' + item"
        @click="locale = item"
      />
    </VList>
  </VMenu>
</template>

<script setup lang="ts">
import { attachToLocalStorage } from '@/utils/persist'
import { useI18n } from 'vue-i18n'

const { availableLocales, locale } = useI18n({ useScope: 'global' })
attachToLocalStorage('locale', locale)
</script>
