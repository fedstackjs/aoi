<template>
  <div class="u-grid u-grid-cols-2">
    <VCheckbox v-model="model.allowPublicLogin" :label="t('allow-public-login')" />
    <VCheckbox v-model="model.allowDeviceFlow" :label="t('allow-device-flow')" />
    <VCheckbox v-model="model.requireMfa" :label="t('require-mfa')" />
    <VCheckbox v-model="model.attachUser" :label="t('attach-user')" />
    <VCheckbox v-model="model.attachMembership" :label="t('attach-membership')" />
    <VCheckbox v-model="model.enableIaaa" :label="t('enable-iaaa')" />
  </div>
  <VCombobox v-model="model.scopes" :label="t('scopes')" multiple chips />
  <VCardSubtitle> {{ t('redirect-uris') }} </VCardSubtitle>
  <OptionalInput v-model="model.redirectUris" :init="() => []">
    <template v-slot="scoped">
      <ListInput
        v-model="scoped.value"
        :init="() => ({ uri: '', label: '' })"
        :label="t('redirect-uris')"
      >
        <template v-slot="scoped">
          <VTextField v-model="scoped.value.uri" :label="t('uri')" />
          <VTextField v-model="scoped.value.label" :label="t('label')" />
        </template>
      </ListInput>
    </template>
  </OptionalInput>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ListInput from '../utils/ListInput.vue'
import OptionalInput from '../utils/OptionalInput.vue'

import type { IAppSettingsDTO } from './types'

const model = defineModel<IAppSettingsDTO>({ required: true })
const { t } = useI18n()
</script>
<i18n>
en:
  allow-public-login: Allow public login
  allow-device-flow: Allow device flow
  require-mfa: Require MFA
  attach-user: Attach user in response
  attach-membership: Attach membership in response
  enable-iaaa: Enable IAAA compat login

zh-Hans:
  allow-public-login: 允许公共登录
  allow-device-flow: 允许设备登录
  require-mfa: 需要多因素认证
  attach-user: 在响应中附加用户
  attach-membership: 在响应中附加成员信息
  enable-iaaa: 启用 IAAA 兼容登录
</i18n>
