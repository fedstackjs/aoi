<template>
  <VCardTitle>
    {{ t('user-auth') }}
  </VCardTitle>
  <VSkeletonLoader type="image" v-if="login.isLoading.value" />
  <VCardText v-else>
    <VAlert v-if="enableMfa && !hasMfaToken" type="info" color="" :title="t('mfa-required')">
      <VBtn variant="outlined" @click="doVerify" :text="t('do-verify')" />
    </VAlert>
    <VRow v-else>
      <VCol v-for="method of login.state.value.providers" :key="method">
        <VCard variant="outlined" :title="t(`provider-${method}`)">
          <component :is="components[method]" :userId="userId" />
        </VCard>
      </VCol>
    </VRow>
  </VCardText>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'

import UserAuthIaaa from './UserAuthIaaa.vue'
import UserAuthMail from './UserAuthMail.vue'
import UserAuthPassword from './UserAuthPassword.vue'

import { useMfa } from '@/stores/app'
import { enableMfa } from '@/utils/flags'
import { http } from '@/utils/http'

defineProps<{
  userId: string
}>()

const { t } = useI18n()
const { hasMfaToken, doVerify } = useMfa()

const components: Record<string, Component> = {
  password: UserAuthPassword,
  mail: UserAuthMail,
  iaaa: UserAuthIaaa
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
  provider-iaaa: IAAA Login
  mfa-required: MFA Required
  do-verify: Verify
zh-Hans:
  user-auth: 用户认证
  provider-password: 密码登录
  provider-mail: 邮箱登录
  provider-iaaa: 北京大学统一身份认证
  mfa-required: 需要多因子身份认证
  do-verify: 开始认证
</i18n>
