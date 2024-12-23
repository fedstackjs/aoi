<template>
  <VForm fast-fail validate-on="submit lazy" @submit.prevent="verify">
    <VCardText>
      <VTextField
        v-model="phone"
        prepend-inner-icon="mdi-phone"
        :label="t('term.telephone')"
        :rules="phoneRules"
      />

      <div id="vaptcha"></div>

      <VOtpInput v-if="token" v-model.trim="code" />
    </VCardText>

    <VCardActions v-if="token">
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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import type { SubmitEventPromise } from 'vuetify'

import { useMfa } from '@/stores/app'
import { http, prettyHTTPError } from '@/utils/http'
import { useVaptcha } from '@/utils/vaptcha'

const { t } = useI18n()
const toast = useToast()
const { postVerify } = useMfa()
const { token } = useVaptcha({ onPass: preVerify })

const phone = ref('')
const code = ref('')

const phoneRules = [
  (value: string) => {
    const re = /^1\d{10}$/
    if (re.test(value)) return true
    return t('hint.violate-phone-rule')
  }
]

const isLoading = ref(false)

async function preVerify() {
  try {
    await http.post('auth/preVerify', {
      json: {
        provider: 'sms',
        payload: {
          phone: phone.value,
          token: token.value
        }
      }
    })
    toast.success(t('hint.sms-sent'))
  } catch (err) {
    toast.error(t('hint.sms-send-failed', { msg: await prettyHTTPError(err) }))
  }
}

async function verify(ev: SubmitEventPromise) {
  isLoading.value = true
  const result = await ev
  if (!result.valid) return

  try {
    const resp = await http.post('auth/verify', {
      json: {
        provider: 'sms',
        payload: {
          phone: phone.value,
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
    violate-phone-rule: Invalid phone number
    violate-code-rule: Invalid code
    sms-sent: SMS sent
    sms-send-failed: 'SMS send failed: {msg}. Please refresh the page.'
    verify-wrong-credentials: Wrong sms or code
    verify-success: Verified successfully
zh-Hans:
  hint:
    violate-phone-rule: 无效的手机号
    violate-code-rule: 验证码无效
    sms-sent: 短信已发送
    sms-send-failed: '短信发送失败：{msg}。请刷新页面重试。'
    verify-wrong-credentials: 验证码错误
    verify-success: 验证成功
</i18n>
