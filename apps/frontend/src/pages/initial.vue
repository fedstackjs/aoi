<template>
  <VCard class="mt-6 mx-auto pa-4" max-width="450" :title="t('pages.modify-passwd')">
    <VAlert type="info" class="mb-4">{{ t('hint.initial-tips') }}</VAlert>
    <VTextField
      v-model="payload.oldPassword"
      type="text"
      prepend-inner-icon="mdi-lock-outline"
      :label="t('old-password')"
      :rules="passwordRules"
    />
    <VTextField
      v-model="payload.newPassword"
      :append-inner-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
      :type="showNewPassword ? 'text' : 'password'"
      prepend-inner-icon="mdi-lock-outline"
      @click:append-inner="showNewPassword = !showNewPassword"
      :label="t('new-password')"
      :rules="passwordRules"
    />
    <VBtn type="submit" @click="submit()" color="primary" block size="large" class="mt-4">
      {{ t('submit') }}
    </VBtn>
  </VCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import { http } from '@/utils/http'

const { t } = useI18n()
const router = useRouter()
// get uid from url query
const uid = router.currentRoute.value.query.uid as string
console.log(uid)
const toast = useToast()

const showNewPassword = ref<boolean>(false)
const passwordRules = [
  (value: string) => {
    if (value.length >= 8) return true
    return t('hint.violate-password-rule')
  }
]

const payload = ref<{
  userId: string
  oldPassword: string
  newPassword: string
}>({
  userId: uid,
  oldPassword: '',
  newPassword: ''
})

async function submit() {
  if (!passwordRules.every((rule) => rule(payload.value.oldPassword) === true)) return
  if (!passwordRules.every((rule) => rule(payload.value.newPassword) === true)) return
  try {
    await http.post('auth/resetPassword', {
      json: payload.value
    })
    toast.success(t('hint.success'))
    router.replace('/')
  } catch (err) {
    toast.error(t('hint.signin-wrong-credentials'))
    return
  }
}
</script>

<i18n>
en:
  submit: Submit
  old-password: Old Password
  new-password: New Password
  hint:
    violate-password-rule: Password must be at least 8 characters.
    initial-tips: Log in for the first time, please modify the password.
    success: Successfully modified the password, please re-login.
    signin-wrong-credentials: Wrong password.
zh-Hans:
  submit: 提交
  old-password: 旧密码
  new-password: 新密码
  hint:
    violate-password-rule: 密码至少需要8个字符
    initial-tips: 首次登录，请修改密码
    success: 密码修改成功，请重新登录
    signin-wrong-credentials: 密码错误
</i18n>
