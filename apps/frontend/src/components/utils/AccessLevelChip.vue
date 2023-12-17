<template>
  <VChip :text="accessLevels[accessLevel] ?? 'ERROR'" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  accessLevel: number
}>()

const accessLevels = [t('auth.public'), t('auth.restricted'), t('auth.private')]
</script>
