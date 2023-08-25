<template>
  <VCard class="mt-6 mx-auto pa-4" max-width="450" :title="t('pages.signup')">
    <VCardTitle class=""></VCardTitle>
    <VForm fast-fail @submit.prevent>
      <VTextField
        v-model="username"
        prepend-inner-icon="mdi-account-outline"
        :label="t('term.username')"
        :rules="usernameRules"
      />

      <VTextField
        v-model="realname"
        prepend-inner-icon="mdi-account-outline"
        :label="t('term.realname')"
      />

      <VTextField
        v-model="email"
        prepend-inner-icon="mdi-email-outline"
        :label="t('term.email')"
        :rules="emailRules"
      />

      <VTextField
        v-model="password"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-outline"
        @click:append-inner="showPassword = !showPassword"
        :label="t('term.password')"
        :rules="passwordRules"
      />

      <VBtn type="submit" @click="signup()" color="primary" block size="large" class="mt-4">
        {{ t('pages.signup') }}
      </VBtn>

      <VCardText class="text-center">
        <VBtn
          variant="text"
          prepend-icon="mdi-chevron-left"
          :text="t('pages.signin')"
          to="/signin"
        />
      </VCardText>
    </VForm>
  </VCard>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppState } from '@/stores/app'
import { useRouter } from 'vue-router'
import { http, login } from '@/utils/http'

const { t } = useI18n()
const router = useRouter()
const appState = useAppState()
if (appState.loggedIn) router.replace('/')

const username = ref('')
const realname = ref('')
const password = ref('')
const email = ref('')

const usernameRules = [
  (value: string) => {
    if (value.length >= 8) return true
    return t('hint.violate-username-rule')
  }
]

const passwordRules = [
  (value: string) => {
    if (value.length >= 8) return true
    return t('hint.violate-password-rule')
  }
]

const emailRules = [
  (value: string) => {
    const emailRegex = /^\S+@\S+\.\S+$/
    // simple regex from: https://stackoverflow.com/a/201447
    if (value.length > 0 && emailRegex.test(value)) return true
    return t('hint.violate-email-rule')
  }
]

const realnameRules = [
  (value: string) => {
    if (value.length > 0) return true
    return t('hint.violate-realname-rule')
  }
]

const showPassword = ref<boolean>(false)

withTitle(computed(() => t('pages.signup')))

async function signup() {
  if (
    (
      [
        [username, usernameRules],
        [password, passwordRules],
        [email, emailRules],
        [realname, realnameRules]
      ] as const
    ).some(([value, rules]) => rules.some((rule) => rule(value.value) !== true))
  )
    return
  const resp = await http.post('auth/signup', {
    json: {
      profile: {
        name: username.value,
        realname: realname.value,
        email: email.value
      },
      password: password.value
    }
  })
  const { token } = await resp.json<{ token: string }>()
  login(token)
  router.push('/signin')
}
</script>
<i18n>
en:
  hint:
    violate-username-rule: Username must be at least 8 characters.
    violate-password-rule: Password must be at least 8 characters.
    violate-email-rule: Invalid email.
    violate-realname-rule: Realname must not be empty.
zh-Hans:
  hint:
    violate-username-rule: 用户名至少需要8个字符
    violate-password-rule: 密码至少需要8个字符
    violate-email-rule: 非法邮箱
    violate-realname-rule: 真实名不能为空
  </i18n>
