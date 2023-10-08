<template>
  <VCard class="mt-6 mx-auto pa-4" max-width="450" :title="t('pages.modify-passwd')">
    <VAlert type="info" class="mb-4">{{ t('hint.initial-tips') }}</VAlert>
    <SettingsEditor :endpoint="`user/${appState.userId}/password`" @updated="router.push('/')">
      <template v-slot="scoped">
        <InitialPasswordInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
  </VCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SettingsEditor from '@/components/utils/SettingsEditor.vue'
import { useAppState } from '@/stores/app'
import InitialPasswordInput from '@/components/initial/InitialPasswordInput.vue'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const appState = useAppState()
const router = useRouter()
</script>

<i18n>
en:
  hint:
    initial-tips: Log in for the first time, please modify the password.
zh-Hans:
  hint:
    initial-tips: 首次登录，请修改密码
</i18n>
