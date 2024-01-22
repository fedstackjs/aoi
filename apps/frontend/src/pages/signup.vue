<template>
  <VCard class="mt-6 mx-auto pa-4" max-width="450" :title="t('pages.signup')">
    <VCardTitle class=""></VCardTitle>
    <VForm fast-fail @submit.prevent>
      <VTextField
        v-model="username"
        prepend-inner-icon="mdi-account-outline"
        :label="t('term.username')"
        :rules="usernameRules"
      />

      <VTextField
        v-model="realname"
        prepend-inner-icon="mdi-account-outline"
        :label="t('term.realname')"
      />

      <VTextField
        v-model="email"
        prepend-inner-icon="mdi-email-outline"
        :label="t('term.email')"
        :rules="emailRules"
      />

      <VTextField
        v-model="password"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-outline"
        @click:append-inner="showPassword = !showPassword"
        :label="t('term.password')"
        :rules="passwordRules"
      />

      <VTextField
        v-model="telephone"
        prepend-inner-icon="mdi-phone-outline"
        :label="t('term.telephone')"
        :rules="telephoneRules"
      />

      <VTextField
        v-model="school"
        prepend-inner-icon="mdi-identifier"
        :label="t('term.school')"
        :rules="schoolRules"
      />

      <VTextField
        v-model="studentGrade"
        prepend-inner-icon="mdi-account-school-outline"
        :label="t('term.student-grade')"
        :rules="studentGradeRules"
      />

      <VBtn type="submit" @click="signup()" color="primary" block size="large" class="mt-4">
        {{ t('pages.signup') }}
      </VBtn>

      <VCardText class="text-center">
        <VBtn
          variant="text"
          prepend-icon="mdi-chevron-left"
          :text="t('pages.signin')"
          to="/auth/login"
        />
      </VCardText>
    </VForm>
  </VCard>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppState } from '@/stores/app'
import { useRouter } from 'vue-router'
import { http, login } from '@/utils/http'
import { useToast } from 'vue-toastification'

const { t } = useI18n()
const router = useRouter()
const appState = useAppState()
const toast = useToast()
if (appState.loggedIn) router.replace('/')

const username = ref('')
const realname = ref('')
const password = ref('')
const email = ref('')
const telephone = ref('')
const school = ref('')
const studentGrade = ref('')

const usernameRules = [
  (value: string) => {
    if (value.length > 0) return true
    return t('hint.violate-username-rule')
  }
]

const passwordRules = [
  (value: string) => {
    if (value.length >= 8) return true
    return t('hint.violate-password-rule')
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
    const telRegex = /^1[3456789]\d{9}$/
    if (value.length > 0 && telRegex.test(value)) return true
    return t('hint.violate-telephone-rule')
  }
]

const schoolRules = [
  (value: string) => {
    if (value.length > 0) return true
    return t('hint.violate-school-rule')
  }
]

const studentGradeRules = [
  (value: string) => {
    if (value.length > 0) return true
    return t('hint.violate-stugrade-rule')
  }
]

const showPassword = ref<boolean>(false)

withTitle(computed(() => t('pages.signup')))

async function signup() {
  if (
    (
      [
        [username, usernameRules],
        [password, passwordRules],
        [email, emailRules],
        [realname, realnameRules],
        [telephone, telephoneRules],
        [school, schoolRules],
        [studentGrade, studentGradeRules]
      ] as const
    ).some(([value, rules]) => rules.some((rule) => rule(value.value) !== true))
  )
    return
  try {
    const resp = await http.post('auth/signup', {
      json: {
        profile: {
          name: username.value,
          realname: realname.value,
          email: email.value,
          telephone: telephone.value,
          school: school.value,
          studentGrade: studentGrade.value
        },
        password: password.value
      }
    })
    const { token } = await resp.json<{ token: string }>()
    login(token)
    toast.success(t('hint.signup-success'))
    router.push('auth/login')
  } catch (error) {
    toast.error(t('hint.signup-username-exists'))
    return
  }
}
</script>
<i18n>
en:
  hint:
    violate-username-rule: Username must not be empty.
    violate-password-rule: Password must be at least 8 characters.
    violate-email-rule: Invalid email.
    violate-realname-rule: Realname must not be empty.
    violate-telephone-rule: Invalid telephone.
    violate-school-rule: Student ID must not be empty.
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
    violate-school-rule: 学号不能为空
    violate-stugrade-rule: 年级不能为空
    signup-username-exists: 用户名已存在
    signup-success: 注册成功
</i18n>
