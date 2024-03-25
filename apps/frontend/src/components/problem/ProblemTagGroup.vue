<template>
  <div>
    <VChip
      class="ma-1"
      v-for="pkg in tagsPkg"
      :key="pkg[0]"
      :to="urlTo(pkg[0])"
      :color="pkg[3]"
      :prepend-icon="pkg[2]"
      >{{ pkg[1] }}</VChip
    >
    <template v-if="!(props.accessLevel === undefined)">
      <AccessLevelChip class="ma-1" :accessLevel="props.accessLevel as number" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import AccessLevelChip from '@/components/utils/AccessLevelChip.vue'

const { t } = useI18n()
const d = (tag: string) => tag.startsWith('@')

const props = defineProps<{
  urlPrefix?: string
  tags: string[]
  accessLevel?: number
}>()

const urlTo = (target: string) =>
  props.urlPrefix ? `${props.urlPrefix}/${encodeURIComponent(target)}` : undefined

const tagMap = new Map([
  ['@easy', ['@easy', t('difficulty.easy'), 'mdi-star-outline', 'green']],
  ['@medium', ['@medium', t('difficulty.medium'), 'mdi-star-outline', 'orange']],
  ['@hard', ['@hard', t('difficulty.hard'), 'mdi-star-outline', 'red']]
])

const tagsPkg = computed(() => {
  return [...props.tags]
    .sort((a: string, b: string) => {
      const p = d(a),
        q = d(b)
      return p == q ? a.localeCompare(b) : p ? -1 : 1
    })
    .map((rawTag) => tagMap.get(rawTag) ?? [rawTag, rawTag, '', 'default'])
})
</script>
