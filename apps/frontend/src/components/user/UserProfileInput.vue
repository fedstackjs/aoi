<template>
  <VTextField v-model="model.name" :label="t('term.name')" type="string" :rules="usernameRules" />
  <VTextField v-model="model.email" :label="t('term.email')" type="string" :rules="emailRules" />
  <VTextField
    v-model="model.realname"
    :label="t('term.realname')"
    type="string"
    :rules="realnameRules"
  />
  <VTextField
    v-model="model.telephone"
    :label="t('term.telephone')"
    type="string"
    :rules="telephoneRules"
  />
  <VTextField
    v-model="model.studentId"
    :label="t('term.student-id')"
    type="string"
    :rules="studentIdRules"
  />
  <VTextField
    v-model="model.studentGrade"
    :label="t('term.student-grade')"
    type="string"
    :rules="studentGradeRules"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const model = defineModel<{
  name: string
  email: string
  realname: string
  telephone: string
  studentId: string
  studentGrade: string
}>({ required: true })

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
  (value: string) => {
    if (value.length > 0) return true
    return t('hint.violate-realname-rule')
  }
]

const telephoneRules = [
  (value: string) => {
    const telRegex = /\d{3}-\d{8}|\d{4}-\d{7}|^1(3[0-9]|4[57]|5[0-35-9]|7[0678]|8[0-9])\d{8}$/
    // from https://blog.csdn.net/weixin_45099902/article/details/100561013
    if (value.length > 0 && telRegex.test(value)) return true
    return t('hint.violate-telephone-rule')
  }
]

const studentIdRules = [
  (value: string) => {
    if (value.length > 0) return true
    return t('hint.violate-stuid-rule')
  }
]

const studentGradeRules = [
  (value: string) => {
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
    violate-stuid-rule: Student ID must not be empty.
    violate-stugrade-rule: Student Grade must not be empty.
    signup-username-exists: Username already exists.
    signup-success: Sign up successfully.
zh-Hans:
  hint:
    violate-username-rule: 用户名不能为空
    violate-password-rule: 密码至少需要8个字符
    violate-email-rule: 邮箱格式不合法
    violate-realname-rule: 真实名不能为空
    violate-telephone-rule: 电话号码格式不合法
    violate-stuid-rule: 学号不能为空
    violate-stugrade-rule: 年级不能为空
    signup-username-exists: 用户名已存在
    signup-success: 注册成功
</i18n>
