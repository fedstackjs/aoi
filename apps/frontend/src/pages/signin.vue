<template>
  <VCard class="mt-6 mx-auto pa-4" max-width="450" :title="t('pages.signin')">
    <VCardTitle class=""></VCardTitle>
    <VForm fast-fail @submit.prevent>
      <VTextField
        v-model="username"
        prepend-inner-icon="mdi-account-outline"
        :label="t('term.username')"
        :rules="usernameRules"
      >
      </VTextField>

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

      <VBtn type="submit" @click="signin()" color="primary" block size="large" class="mt-4">
        {{ t('pages.signin') }}
      </VBtn>

      <VCardText class="d-flex justify-center">
        <VBtn variant="text" to="/forgot"> {{ t('pages.forgot-passwd') }} </VBtn>
        <VBtn variant="text" to="/signup"> {{ t('pages.signup') }} </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { http, login } from '@/utils/http'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppState } from '@/stores/app'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const { t } = useI18n()
const router = useRouter()
const appState = useAppState()
const toast = useToast()

if (appState.loggedIn) router.replace('/')

const username = ref('')
const password = ref('')

const usernameRules = [
  (value: string) => {
    if (value.length > 0) return true
    return t('hint.violate-username-rule')
  }
]

const passwordRules = [
  (value: string) => {
    if (value.length >= 8) return true
    return t('hint.violate-password-rule')
  }
]

const showPassword = ref<boolean>(false)

withTitle(computed(() => t('pages.signin')))

async function signin() {
  if (!usernameRules.every((rule) => rule(username.value) === true)) return
  if (!passwordRules.every((rule) => rule(password.value) === true)) return
  try {
    const resp = await http.post('auth/login', {
      json: { username: username.value, password: password.value }
    })
    const { token } = await resp.json<{ token: string }>()
    login(token)
    toast.success(t('hint.signin-success'))
    router.replace('/')
  } catch (err) {
    toast.error(t('hint.signin-wrong-credentials'))
    return
  }
}
</script>
<i18n>
en:
  hint:
    violate-username-rule: Username must not be empty.
    violate-password-rule: Password must be at least 8 characters.
    signin-wrong-credentials: Wrong username or password.
    signin-success: Sign in successfully.
zh-Hans:
  hint:
    violate-username-rule: 用户名不能为空
    violate-password-rule: 密码至少需要8个字符
    signin-wrong-credentials: 用户名或密码错误
    signin-success: 登录成功
</i18n>
