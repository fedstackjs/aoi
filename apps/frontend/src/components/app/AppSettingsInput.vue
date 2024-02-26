<template>
  <div class="u-grid u-grid-cols-2">
    <VCheckbox v-model="model.allowPublicLogin" :label="t('allow-public-login')" />
    <VCheckbox v-model="model.requireMfa" :label="t('require-mfa')" />
    <VCheckbox v-model="model.attachUser" :label="t('attach-user')" />
    <VCheckbox v-model="model.attachMembership" :label="t('attach-membership')" />
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
import ListInput from '../utils/ListInput.vue'
import OptionalInput from '../utils/OptionalInput.vue'
import type { IAppSettingsDTO } from './types'
import { useI18n } from 'vue-i18n'

const model = defineModel<IAppSettingsDTO>({ required: true })
const { t } = useI18n()
</script>
<i18n>
en:
  allow-public-login: Allow public login
  require-mfa: Require MFA
  attach-user: Attach user in response
  attach-membership: Attach membership in response

zh-Hans:
  allow-public-login: 允许公共登录
  require-mfa: 需要多因素认证
  attach-user: 在响应中附加用户
  attach-membership: 在响应中附加成员信息
</i18n>
