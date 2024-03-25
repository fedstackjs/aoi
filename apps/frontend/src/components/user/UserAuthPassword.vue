<template>
  <VCardText>
    <VTextField
      v-if="!enableMfa"
      v-model="oldPassword"
      :label="t('old-password')"
      type="password"
    />
    <VTextField v-model="newPassword" :label="t('new-password')" type="password" />
  </VCardText>
  <VCardActions>
    <VBtn variant="elevated" @click="updateTask.execute()" :loading="updateTask.isLoading.value">
      {{ t('action.update') }}
    </VBtn>
  </VCardActions>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { enableMfa } from '@/utils/flags'
import { useChangePassword } from '@/utils/user/password'

const props = defineProps<{
  userId: string
}>()

const { t } = useI18n()

const { oldPassword, newPassword, updateTask } = useChangePassword(toRef(props, 'userId'))
</script>

<i18n>
en:
  old-password: Old Password
  new-password: New Password
zh-Hans:
  old-password: 旧密码
  new-password: 新密码
</i18n>
