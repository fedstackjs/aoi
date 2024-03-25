<template>
  <VCardSubtitle>
    {{ t('auth.access-level') }}
  </VCardSubtitle>
  <VCardText class="d-flex justify-center">
    <AccessLevelInput v-model="value" />
  </VCardText>
  <VCardActions>
    <VBtn color="red" @click="reset">
      {{ t('action.reset') }}
    </VBtn>
    <VBtn color="primary" @click="save">
      {{ t('action.save') }}
    </VBtn>
  </VCardActions>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'

import AccessLevelInput from './AccessLevelInput.vue'

import { http } from '@/utils/http'

const props = defineProps<{
  prefix: string
  accessLevel: number
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
const toast = useToast()
const value = ref(props.accessLevel)

function reset() {
  value.value = props.accessLevel
}

async function save() {
  try {
    await http.patch(props.prefix, {
      json: {
        accessLevel: value.value
      }
    })
    emit('updated')
  } catch (err) {
    toast.error(`Error: ${err}`)
  }
}
</script>
