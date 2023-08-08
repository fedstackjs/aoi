<template>
  <VCard>
    <VCardTitle class="d-flex justify-between">
      <div>
        <p class="text-h4">{{ problem.title }}</p>
        <p class="text-h6 ml-2">{{ problem.slug }}</p>
      </div>
      <div>
        <VChipGroup class="justify-end">
          <VChip v-for="tag in problem.tags" class="mx-2" :key="tag">
            {{ tag }}
          </VChip>
        </VChipGroup>
      </div>
    </VCardTitle>
    <VDivider />

    <VTabs v-model="currentTab">
      <VTab prepend-icon="mdi-book-outline" value="desc">
        {{ t('problem-description') }}
      </VTab>
      <VTab prepend-icon="mdi-upload-outline" value="submit" v-if="problem.config">
        {{ t('problem-submit') }}
      </VTab>
      <VTab prepend-icon="mdi-attachment" value="attachments">
        {{ t('problem-attachments') }}
      </VTab>
      <VTab prepend-icon="mdi-database-outline" value="data" v-if="canManageData">
        {{ t('problem-data') }}
      </VTab>
      <VTab prepend-icon="mdi-cog-outline" value="management">
        {{ t('problem-management') }}
      </VTab>
    </VTabs>
    <VWindow v-model="currentTab">
      <VWindowItem value="desc">
        <TabDescription :description="problem.description" />
      </VWindowItem>
      <VWindowItem value="submit">
        <TabSubmit :problem="problem" />
      </VWindowItem>
      <VWindowItem value="attachments">
        <TabAttachments :problem="problem" />
      </VWindowItem>
      <VWindowItem value="data">
        <TabData :problem="problem" @updated="emit('updated')" />
      </VWindowItem>
      <VWindowItem value="management">
        <TabAdmin :problem="problem" @updated="emit('updated')" />
      </VWindowItem>
    </VWindow>
  </VCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { IProblemDTO } from './types'
import { useI18n } from 'vue-i18n'
import TabDescription from './TabDescription.vue'
import TabSubmit from './TabSubmit.vue'
import TabAttachments from './TabAttachments.vue'
import TabData from './TabData.vue'
import TabAdmin from './TabAdmin.vue'
import { computed } from 'vue'
import { hasCapability } from '@/utils/capability'

const props = defineProps<{
  problem: IProblemDTO
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const currentTab = ref('desc')
const { t } = useI18n()

const canManageData = computed(() => hasCapability(props.problem.capability, 2))
</script>
