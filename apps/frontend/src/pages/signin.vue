<template>
  <VCard class="mt-6 mx-auto pa-4" max-width="450" :title="t('signin')">
    <VCardTitle class=""></VCardTitle>
    <VForm fast-fail @submit.prevent>
      <VTextField
        v-model="username"
        prepend-inner-icon="mdi-account-outline"
        label="Username"
        :rules="usernameRules"
      >
      </VTextField>

      <VTextField
        v-model="password"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-outline"
        @click:append-inner="showPassword = !showPassword"
        label="Password"
        :rules="passwordRules"
      >
      </VTextField>

      <VBtn type="submit" @click="signin()" color="primary" block size="large" class="mt-4">
        Sign in
      </VBtn>

      <VCardText class="d-flex justify-center">
        <VBtn variant="text" to="/forgot"> Forgot password </VBtn>
        <VBtn variant="text" to="/signup"> Sign up </VBtn>
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

const { t } = useI18n()
const router = useRouter()
const appState = useAppState()

if (appState.loggedIn) router.replace('/')

const username = ref('')
const password = ref('')

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

const showPassword = ref<boolean>(false)

withTitle(computed(() => t('signin')))

async function signin() {
  if (!usernameRules.every((rule) => rule(username.value) === true)) return
  if (!passwordRules.every((rule) => rule(password.value) === true)) return
  const resp = await http.post('auth/login', {
    json: { username: username.value, password: password.value }
  })
  const { token } = await resp.json<{ token: string }>()
  login(token)
  router.replace('/')
}
</script>
