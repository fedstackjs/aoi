<template>
  <AsyncState :state="settings">
    <template v-slot="scoped">
      <VCardText>
        <slot v-bind="scoped" />
      </VCardText>
      <VCardActions>
        <VBtn color="error" variant="elevated" @click="settings.execute()">
          {{ t('action.reset') }}
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :loading="patchSettings.isLoading.value"
          @click="patchSettings.execute()"
        >
          {{ t('action.save') }}
        </VBtn>
        <VBtn
          v-if="props.allowDelete"
          color="error"
          variant="elevated"
          :loading="deleteSettings.isLoading.value"
          @click="deleteSettings.execute()"
        >
          {{ t('action.delete') }}
        </VBtn>
      </VCardActions>
    </template>
  </AsyncState>
</template>

<script setup lang="ts" generic="T = any, Text extends boolean = false">
import { useI18n } from 'vue-i18n'

import AsyncState from './AsyncState.vue'
import {
  useSettingsEditor,
  type ISettingsEditorEmits,
  type ISettingsEditorProps
} from './SettingsEditor'

const props = defineProps<ISettingsEditorProps<T, Text>>()
const emit = defineEmits<ISettingsEditorEmits>()
const { t } = useI18n()
const { settings, patchSettings, deleteSettings } = useSettingsEditor(props, emit)
</script>
