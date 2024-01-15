<template>
  <VForm fast-fail validate-on="submit lazy" @submit.prevent="signin">
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

      <VTextField
        v-if="emailSent"
        v-model="code"
        prepend-inner-icon="mdi-numeric"
        :label="t('term.otp-code')"
        :rules="codeRules"
      />
    </VCardText>

    <VCardActions>
      <VBtn
        :disabled="!emailSent"
        :loading="isLoading"
        type="submit"
        color="primary"
        block
        size="large"
        variant="flat"
      >
        {{ t('pages.signin') }}
      </VBtn>
    </VCardActions>
  </VForm>
</template>

<script setup lang="ts">
import { http, login } from '@/utils/http'
import { HTTPError } from 'ky'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import type { SubmitEventPromise } from 'vuetify'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

const email = ref('')
const emailIcon = ref('mdi-send')
const emailSent = ref(false)
const code = ref('')

const emailRules = [
  (value: string) => {
    const re = /\S+@\S+\.\S+/
    if (re.test(value)) return true
    return t('hint.violate-email-rule')
  }
]

const codeRules = [
  (value: string) => {
    const re = /^[0-9]{6}$/
    if (re.test(value)) return true
    return t('hint.violate-code-rule')
  }
]

const isLoading = ref(false)

async function preLogin() {
  if (emailSent.value) return
  emailSent.value = true
  emailIcon.value = 'mdi-send-clock'
  try {
    await http.post('auth/preLogin', {
      json: {
        provider: 'mail',
        payload: {
          email: email.value
        }
      }
    })
    toast.success(t('hint.email-sent'))
    emailIcon.value = 'mdi-send-check'
  } catch (err) {
    let msg = `${err}`
    if (err instanceof HTTPError) {
      msg = await err.response
        .json()
        .then(({ message }) => message)
        .catch((err) => `${err}`)
    }
    toast.error(t('hint.email-send-failed', { msg }))
    emailSent.value = false
    emailIcon.value = 'mdi-send'
  }
}

async function signin(ev: SubmitEventPromise) {
  isLoading.value = true
  const result = await ev
  if (!result.valid) return

  try {
    const resp = await http.post('auth/login', {
      json: {
        provider: 'mail',
        payload: {
          email: email.value,
          code: code.value
        }
      }
    })
    const { token, userId } = await resp.json<{ token?: string; userId?: string }>()
    toast.success(t('hint.signin-success'))
    if (token) {
      login(token)
      router.replace('/')
    } else {
      router.replace(`/initial?uid=${userId}`)
    }
  } catch (err) {
    toast.error(t('hint.signin-wrong-credentials'))
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
    signin-wrong-credentials: Wrong email or code
    signin-success: Sign in successfully
zh-Hans:
  hint:
    violate-email-rule: 邮箱地址无效
    violate-code-rule: 验证码无效
    email-sent: 邮件已发送
    email-send-failed: '邮件发送失败: {msg}'
    signin-wrong-credentials: 邮箱或验证码错误
    signin-success: 登录成功
</i18n>
