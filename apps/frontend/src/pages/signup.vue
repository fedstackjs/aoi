<template>
  <VCard class="mt-6 mx-auto pa-4" max-width="450" :title="t('signup')">
    <VCardTitle class=""></VCardTitle>
    <VForm fast-fail @submit.prevent>
      <VTextField
        v-model="username"
        prepend-inner-icon="mdi-account-outline"
        label="Username"
        :rules="usernameRules"
      />

      <VTextField v-model="realname" prepend-inner-icon="mdi-account-outline" label="Realname" />

      <VTextField
        v-model="email"
        prepend-inner-icon="mdi-email-outline"
        label="Email"
        :rules="emailRules"
      />

      <VTextField
        v-model="password"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-outline"
        @click:append-inner="showPassword = !showPassword"
        label="Password"
        :rules="passwordRules"
      />

      <VBtn type="submit" @click="signup()" color="primary" block size="large" class="mt-4">
        Sign up
      </VBtn>

      <VCardText class="text-center">
        <VBtn variant="text" prepend-icon="mdi-chevron-left" text="Sign In" to="/signin" />
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
    return 'Username must be at least 8 characters.'
  }
]

const passwordRules = [
  (value: string) => {
    if (value.length >= 8) return true
    return 'Password must be at least 8 characters.'
  }
]

const emailRules = [
  (value: string) => {
    if (value.length >= 3) return true
    // TODO: needs an regexp
    return 'Email must be at least 3 characters.'
  }
]

const showPassword = ref<boolean>(false)

withTitle(computed(() => t('signup')))

async function signup() {
  if (
    (
      [
        [username, usernameRules],
        [password, passwordRules],
        [email, emailRules]
      ] as const
    ).some(([value, rules]) => rules.some((rule) => rule(value.value) !== true))
  )
    return
  const resp = await http.post('auth/signup', {
    json: {
      profile: {
        username: username.value,
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
