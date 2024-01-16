<template>
  <VCardActions>
    <VBtn variant="elevated" @click="updateTask.execute()" :loading="updateTask.isLoading.value">
      {{ t('rebind-iaaa') }}
    </VBtn>
  </VCardActions>
</template>

<script setup lang="ts">
import { useRebindIaaa } from '@/utils/user/iaaa'
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  userId: string
}>()

const { t } = useI18n()

const { updateTask } = useRebindIaaa(toRef(props, 'userId'))
</script>

<i18n>
en:
  rebind-iaaa: Rebind IAAA
zh-Hans:
  rebind-iaaa: 重新绑定 IAAA
</i18n>
