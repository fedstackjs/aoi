<template>
  <VCardText>
    <VTextField
      v-model="newPhone"
      prepend-inner-icon="mdi-phone"
      :readonly="codeSent"
      :label="t('term.telephone')"
      :rules="phoneRules"
    />
    <VueTurnstile v-model="token" :site-key="siteKey" />
    <VOtpInput v-if="codeSent" v-model.trim="code" />
  </VCardText>
  <VCardActions>
    <VBtn
      variant="elevated"
      color="info"
      :disabled="!token || !phoneValid || codeSent"
      :loading="sendTask.isLoading.value"
      @click="sendTask.execute(token)"
    >
      {{ t('action.send-otp') }}
    </VBtn>
    <VBtn
      variant="elevated"
      @click="updateTask.execute()"
      :loading="updateTask.isLoading.value"
      :disabled="!token || code.length !== 6 || sendTask.isLoading.value"
    >
      {{ t('action.update') }}
    </VBtn>
  </VCardActions>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import VueTurnstile from 'vue-turnstile'

import { useChangePhone } from '@/utils/user/sms'

const props = defineProps<{
  userId: string
}>()

const { t } = useI18n()

const token = ref('')
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
const { newPhone, code, sendTask, updateTask, phoneRules, phoneValid, codeSent } = useChangePhone(
  toRef(props, 'userId')
)
</script>

<i18n>
en:
  code: Code
  hint:
    violate-phone-rule: Invalid phone number
zh-Hans:
  code: 验证码
  hint:
    violate-phone-rule: 无效的手机号
</i18n>
