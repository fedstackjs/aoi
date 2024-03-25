<template>
  <VCardText>
    <VTextField v-model="newEmail" :label="t('term.email')" />
    <VTextField v-model="emailCode" :label="t('email-code')" />
  </VCardText>
  <VCardActions>
    <VBtn
      variant="elevated"
      @click="sendEmailTask.execute()"
      :loading="sendEmailTask.isLoading.value"
    >
      {{ t('action.send-email') }}
    </VBtn>
    <VBtn
      variant="elevated"
      @click="updateEmailTask.execute()"
      :loading="updateEmailTask.isLoading.value"
    >
      {{ t('action.update') }}
    </VBtn>
  </VCardActions>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useChangeEmail } from '@/utils/user/email'

const props = defineProps<{
  userId: string
}>()

const { t } = useI18n()

const { newEmail, emailCode, sendEmailTask, updateEmailTask } = useChangeEmail(
  toRef(props, 'userId')
)
</script>

<i18n>
en:
  email-code: Email Code
  action:
    send-email: Send Email
zh-Hans:
  email-code: 邮箱验证码
  action:
    send-email: 发送邮件
</i18n>
