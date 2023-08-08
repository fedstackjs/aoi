<template>
  <VChipGroup>
    <VChip v-for="capability in capabilities" :key="capability" color="primary">
      {{ t(capability) }}
    </VChip>
  </VChipGroup>
</template>

<script setup lang="ts">
import { hasCapability } from '@/utils/capability'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  capability: string
}>()

const { t } = useI18n()

const OrgCapabilityBit = {
  access: 0,
  problem: 1,
  admin: 2
}

const capabilities = computed(() =>
  Object.entries(OrgCapabilityBit)
    .filter(([, v]) => hasCapability(props.capability, v))
    .map(([k]) => k)
)
</script>
