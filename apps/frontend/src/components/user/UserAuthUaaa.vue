<template>
  <VCardText>
    <VAlert type="info" :text="t('uaaa-wip')" />
  </VCardText>
  <!-- <VCardActions>
    <VBtn variant="elevated">
      {{ t('rebind-uaaa') }}
    </VBtn>
  </VCardActions> -->
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  userId: string
}>()

const { t } = useI18n()

// const { updateTask } = useRebindIaaa(toRef(props, 'userId'))
</script>

<i18n>
en:
  rebind-uaaa: Rebind UAAA
  uaaa-wip: Currently, UAAA is not supported to be bind
zh-Hans:
  rebind-uaaa: 绑定统合身份认证
  uaaa-wip: 当前不支持修改统合身份认证绑定状态
</i18n>
