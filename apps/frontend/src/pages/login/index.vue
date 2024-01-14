<template>
  <VCardText v-if="login.isLoading.value">
    <VSkeletonLoader type="image" />
  </VCardText>
  <VCardText v-else>
    <VRow dense>
      <VCol v-for="method of login.state.value.providers" :key="method" cols="12">
        <VBtn
          :to="`/login/${method}`"
          block
          variant="flat"
          :prepend-icon="icons[method] ?? 'mdi-fingerprint'"
          :color="colors[method]"
        >
          {{ t('provider-' + method) }}
        </VBtn>
      </VCol>
    </VRow>
  </VCardText>
  <VCardText v-if="login.state.value.signup" class="text-center">
    <VBtn variant="tonal" to="/signup"> {{ t('pages.signup') }} </VBtn>
  </VCardText>
</template>

<script setup lang="ts">
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const icons: Record<string, string> = {
  password: 'mdi-lock',
  mail: 'mdi-email'
}

const colors: Record<string, string> = {
  password: 'primary',
  mail: 'blue'
}

const login = useAsyncState(
  () => http.get('auth/login').json<{ providers: string[]; signup: boolean }>(),
  {
    providers: [],
    signup: false
  }
)
</script>

<i18n>
en:
  provider-password: Password Login
  provider-mail: Email Login
zh-Hans:
  provider-password: 密码登录
  provider-mail: 邮箱登录
</i18n>
