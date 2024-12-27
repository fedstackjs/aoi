<template>
  <VCardText>
    <VTextField
      v-model="newPhone"
      prepend-inner-icon="mdi-phone"
      :readonly="codeSent"
      :label="t('term.telephone')"
      :rules="phoneRules"
    />
    <div id="vaptcha"></div>
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
      :disabled="!token || sendTask.isLoading.value"
    >
      {{ t('action.update') }}
    </VBtn>
  </VCardActions>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useChangePhone } from '@/utils/user/sms'

const props = defineProps<{
  userId: string
}>()

const { t } = useI18n()

const { newPhone, code, token, sendTask, updateTask, phoneRules, phoneValid, codeSent } =
  useChangePhone(toRef(props, 'userId'))
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
