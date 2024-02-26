<template>
  <div class="u-grid u-grid-cols-2">
    <VCheckbox v-model="model.allowPublicLogin" :label="t('allow-public-login')" />
    <VCheckbox v-model="model.requireMfa" :label="t('require-mfa')" />
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
  registration-enabled: Registration Enabled
  registration-allow-public: Allow Public Registration
  promotion: Demonstrate on Homepage
zh-Hans:
  registration-enabled: 允许注册
  registration-allow-public: 允许公开注册
  promotion: 在主页展示
</i18n>
