<template>
  <VForm fast-fail validate-on="submit lazy" @submit.prevent="verify">
    <VCardText>
      <VTextField
        v-model="password"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-outline"
        @click:append-inner="showPassword = !showPassword"
        :label="t('term.password')"
        :rules="passwordRules"
      >
      </VTextField>
    </VCardText>

    <VCardActions>
      <VBtn :loading="isLoading" type="submit" color="primary" block size="large" variant="flat">
        {{ t('pages.verify') }}
      </VBtn>
    </VCardActions>
  </VForm>
</template>

<script setup lang="ts">
import { useMfa } from '@/stores/app'
import { http } from '@/utils/http'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import type { SubmitEventPromise } from 'vuetify'

const { t } = useI18n()
const toast = useToast()
const { postVerify } = useMfa()

const password = ref('')

const passwordRules = [
  (value: string) => {
    if (value.length >= 8) return true
    return t('hint.violate-password-rule')
  }
]

const showPassword = ref(false)
const isLoading = ref(false)

async function verify(ev: SubmitEventPromise) {
  isLoading.value = true
  const result = await ev
  if (!result.valid) return

  try {
    const resp = await http.post('auth/verify', {
      json: {
        provider: 'password',
        payload: {
          password: password.value
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
    violate-username-rule: Username must not be empty.
    violate-password-rule: Password must be at least 8 characters.
    verify-wrong-credentials: Wrong username or password.
    verify-success: Verified successfully.
zh-Hans:
  hint:
    violate-username-rule: 用户名不能为空
    violate-password-rule: 密码至少需要8个字符
    verify-wrong-credentials: 用户名或密码错误
    verify-success: 验证成功
</i18n>
