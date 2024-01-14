<template>
  <VCardTitle>
    {{ t('user-auth') }}
  </VCardTitle>
  <VSkeletonLoader type="image" v-if="login.isLoading.value" />
  <VCardText v-else>
    <VRow>
      <VCol v-for="method of login.state.value.providers" :key="method">
        <VCard variant="outlined" :title="t(`provider-${method}`)">
          <component :is="components[method]" :userId="userId" />
        </VCard>
      </VCol>
    </VRow>
  </VCardText>
</template>

<script setup lang="ts">
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import UserAuthPassword from './UserAuthPassword.vue'
import UserAuthMail from './UserAuthMail.vue'
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  userId: string
}>()

const { t } = useI18n()

const components: Record<string, Component> = {
  password: UserAuthPassword,
  mail: UserAuthMail
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
  user-auth: User Authentication
  provider-password: Password Login
  provider-mail: Email Login
zh-Hans:
  user-auth: 用户认证
  provider-password: 密码登录
  provider-mail: 邮箱登录
</i18n>
