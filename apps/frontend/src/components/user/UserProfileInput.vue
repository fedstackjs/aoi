<template>
  <VAlert
    variant="tonal"
    type="info"
    :title="t('msg.tips')"
    :text="t('msg.user-auth-hint')"
    class="u-mb-4"
  />
  <VTextField
    v-model="model.name"
    :label="t('term.name') + (verified['name'] ? t('msg.verified') : '')"
    type="string"
    :rules="usernameRules"
    :append-inner-icon="verified['name']"
    :readonly="!!verified['name']"
  />
  <VTextField
    v-model="model.email"
    :label="t('term.email') + (verified['email'] ? t('msg.verified') : '')"
    type="string"
    :rules="emailRules"
    :append-inner-icon="verified['email']"
    :readonly="!!verified['email']"
  />
  <VTextField
    v-model="model.realname"
    :label="t('term.realname') + (verified['realname'] ? t('msg.verified') : '')"
    type="string"
    :rules="realnameRules"
    :append-inner-icon="verified['realname']"
    :readonly="!!verified['realname']"
  />
  <VTextField
    v-model="model.telephone"
    :label="t('term.telephone') + (verified['telephone'] ? t('msg.verified') : '')"
    type="string"
    :rules="telephoneRules"
    :append-inner-icon="verified['telephone']"
    :readonly="!!verified['telephone']"
  />
  <VTextField
    v-model="model.school"
    :label="t('term.school') + (verified['school'] ? t('msg.verified') : '')"
    type="string"
    :rules="schoolRules"
    :append-inner-icon="verified['school']"
    :readonly="!!verified['school']"
  />
  <VTextField
    v-model="model.studentGrade"
    :label="t('term.student-grade') + (verified['studentGrade'] ? t('msg.verified') : '')"
    type="string"
    :rules="studentGradeRules"
    :append-inner-icon="verified['studentGrade']"
    :readonly="!!verified['studentGrade']"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const model = defineModel<{
  name: string
  email: string
  realname: string
  telephone: string
  school: string
  studentGrade: string
  verified: string[]
}>({ required: true })

const verified = computed(() =>
  Object.fromEntries(
    (model.value.verified ?? []).map((field) => [field, 'mdi-check-decagram-outline'])
  )
)

const usernameRules = [
  (value: string) => {
    if (value.length > 0) return true
    return t('hint.violate-username-rule')
  }
]

const emailRules = [
  (value: string) => {
    const emailRegex = /^\S+@\S+\.\S+$/
    // simple regex from: https://stackoverflow.com/a/201447
    if (value.length > 0 && emailRegex.test(value)) return true
    return t('hint.violate-email-rule')
  }
]

const realnameRules = [
  (value = '') => {
    if (value.length > 0) return true
    return t('hint.violate-realname-rule')
  }
]

const telephoneRules = [
  (value = '') => {
    const telRegex = /^1[3456789]\d{9}$/
    if (value.length > 0 && telRegex.test(value)) return true
    return t('hint.violate-telephone-rule')
  }
]

const schoolRules = [
  (value = '') => {
    if (value.length > 0) return true
    return t('hint.violate-school-rule')
  }
]

const studentGradeRules = [
  (value = '') => {
    if (value.length > 0) return true
    return t('hint.violate-stugrade-rule')
  }
]
</script>
<i18n>
en:
  hint:
    violate-username-rule: Username must not be empty.
    violate-password-rule: Password must be at least 8 characters.
    violate-email-rule: Invalid email.
    violate-realname-rule: Realname must not be empty.
    violate-telephone-rule: Invalid telephone.
    violate-school-rule: School must not be empty.
    violate-stugrade-rule: Student Grade must not be empty.
    signup-username-exists: Username already exists.
    signup-success: Sign up successfully.
  msg:
    verified: ' [Verified]'
    user-auth-hint: Please bind your email, phone number, etc. in "User Authentication". The user information updated through the form below cannot be verified.
zh-Hans:
  hint:
    violate-username-rule: 用户名不能为空
    violate-password-rule: 密码至少需要8个字符
    violate-email-rule: 邮箱格式不合法
    violate-realname-rule: 真实名不能为空
    violate-telephone-rule: 电话号码格式不合法
    violate-school-rule: 学校不能为空
    violate-stugrade-rule: 年级不能为空
    signup-username-exists: 用户名已存在
    signup-success: 注册成功
  msg:
    verified: ' 【已验证】'
    user-auth-hint: 请在“用户认证”处绑定邮箱、手机号等凭据。通过下面的表单更新的用户信息无法得到验证。
</i18n>
