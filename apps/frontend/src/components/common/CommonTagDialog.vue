<template>
  <VDialog width="auto" max-width="640" min-width="640">
    <template v-slot:activator="{ props }">
      <VBtn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-tag-arrow-right-outline"
        :text="t('action.select-tag')"
        v-bind="props"
      />
    </template>

    <VCard :title="t('action.select-tag')">
      <AsyncState :state="tags">
        <template v-slot="{ value }">
          <VCardText class="u-flex u-flex-wrap u-gap-2">
            <template v-if="value.length">
              <VChip v-for="(tag, i) in value" :key="i" :text="tag.label" :to="tag.to" />
            </template>
            <VAlert v-else dense outlined type="warning">
              {{ t('msg.no-tags') }}
            </VAlert>
          </VCardText>
        </template>
      </AsyncState>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCommonTagDialog, type ICommonTagDialogProps } from './CommonTagDialog'
import AsyncState from '../utils/AsyncState.vue'

const props = defineProps<ICommonTagDialogProps>()
const { tags } = useCommonTagDialog(props)
const { t } = useI18n()
</script>
