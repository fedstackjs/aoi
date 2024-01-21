<template>
  <VForm fast-fail validate-on="submit lazy" @submit.prevent="verify">
    <VCardText>
      <VTextField
        v-model="email"
        prepend-inner-icon="mdi-email"
        :label="t('term.email')"
        :rules="emailRules"
        :readonly="emailSent"
        :append-icon="emailIcon"
        @click:append="preLogin"
      />

      <VOtpInput v-if="emailSent" v-model.trim="code" />
    </VCardText>

    <VCardActions v-if="emailSent">
      <VBtn
        :disabled="code.length !== 6"
        :loading="isLoading"
        type="submit"
        color="primary"
        block
        variant="flat"
      >
        {{ t('pages.verify') }}
      </VBtn>
    </VCardActions>
  </VForm>
</template>

<script setup lang="ts">
import { useMfa } from '@/stores/app'
import { http, prettyHTTPError } from '@/utils/http'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import type { SubmitEventPromise } from 'vuetify'

const { t } = useI18n()
const toast = useToast()
const { postVerify } = useMfa()

const email = ref('')
const emailIcon = ref('mdi-send')
const emailSent = ref(false)
const emailSending = ref(false)
const code = ref('')

const emailRules = [
  (value: string) => {
    const re = /\S+@\S+\.\S+/
    if (re.test(value)) return true
    return t('hint.violate-email-rule')
  }
]

const isLoading = ref(false)

async function preLogin() {
  if (emailSending.value) return
  emailSending.value = true
  emailIcon.value = 'mdi-send-clock'
  try {
    await http.post('auth/preVerify', {
      json: {
        provider: 'mail',
        payload: {
          email: email.value
        }
      }
    })
    toast.success(t('hint.email-sent'))
    emailIcon.value = 'mdi-send-check'
    emailSent.value = true
  } catch (err) {
    toast.error(t('hint.email-send-failed', { msg: await prettyHTTPError(err) }))
    emailIcon.value = 'mdi-send'
  }
  emailSending.value = false
}

async function verify(ev: SubmitEventPromise) {
  isLoading.value = true
  const result = await ev
  if (!result.valid) return

  try {
    const resp = await http.post('auth/verify', {
      json: {
        provider: 'mail',
        payload: {
          code: code.value
        }
      }
    })
    const { token } = await resp.json<{ token: string }>()
    toast.success(t('hint.verify-success'))
    postVerify(token)
  } catch (err) {
    toast.error(t('hint.verify-wrong-credentials'))
  }
  isLoading.value = false
}
</script>

<i18n>
en:
  hint:
    violate-email-rule: Invalid email address
    violate-code-rule: Invalid code
    email-sent: Email sent
    email-send-failed: 'Failed to send email: {msg}'
    verify-wrong-credentials: Wrong email or code
    verify-success: Verified successfully
zh-Hans:
  hint:
    violate-email-rule: 邮箱地址无效
    violate-code-rule: 验证码无效
    email-sent: 邮件已发送
    email-send-failed: '邮件发送失败: {msg}'
    verify-wrong-credentials: 邮箱或验证码错误
    verify-success: 验证成功
</i18n>
