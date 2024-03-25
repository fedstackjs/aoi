<template>
  <VTextField
    v-model="model.oldPassword"
    type="text"
    prepend-inner-icon="mdi-lock-outline"
    :label="t('old-password')"
    :rules="passwordRules"
  />
  <VTextField
    v-model="model.newPassword"
    :append-inner-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
    :type="showNewPassword ? 'text' : 'password'"
    prepend-inner-icon="mdi-lock-outline"
    @click:append-inner="showNewPassword = !showNewPassword"
    :label="t('new-password')"
    :rules="passwordRules"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const showNewPassword = ref<boolean>(false)
const passwordRules = [
  (value: string) => {
    if (value.length >= 8) return true
    return t('hint.violate-password-rule')
  }
]

const model = defineModel<{
  oldPassword: string
  newPassword: string
}>({ required: true })
</script>

<i18n>
en:
  hint:
    violate-password-rule: Password must be at least 8 characters.
  old-password: Old Password
  new-password: New Password
zh-Hans:
  hint:
    violate-password-rule: 密码至少需要8个字符
  old-password: 旧密码
  new-password: 新密码
</i18n>
