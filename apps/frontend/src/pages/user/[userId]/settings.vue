<template>
  <VCard>
    <VCardActions>
      <VBtn variant="text" prepend-icon="mdi-chevron-left" :to="`/user/${props.userId}`">
        {{ t('back-to-user-info') }}
      </VBtn>
    </VCardActions>
    <VDivider />
    <SettingsEditor
      :endpoint="`user/${props.userId}/profile`"
      @updated="invalidateProfile(props.userId)"
    >
      <template v-slot="scoped">
        <UserProfileInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
    <VDivider />
    <VCardText>
      <VTextField v-model="oldPassword" :label="t('old-password')" type="password" />
      <VTextField v-model="newPassword" :label="t('new-password')" type="password" />
    </VCardText>
    <VCardActions>
      <VBtn variant="elevated" @click="updateTask.execute()" :loading="updateTask.isLoading.value">
        {{ t('action.update') }}
      </VBtn>
    </VCardActions>
    <VDivider />
    <VCardText>
      <VTextField v-model="newEmail" :label="t('term.email')" />
      <VTextField v-model="emailCode" :label="t('email-code')" />
    </VCardText>
    <VCardActions>
      <VBtn
        variant="elevated"
        @click="sendEmailTask.execute()"
        :loading="sendEmailTask.isLoading.value"
      >
        {{ t('action.send-email') }}
      </VBtn>
      <VBtn
        variant="elevated"
        @click="updateEmailTask.execute()"
        :loading="updateEmailTask.isLoading.value"
      >
        {{ t('action.update') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { useI18n } from 'vue-i18n'
import SettingsEditor from '@/components/utils/SettingsEditor.vue'
import UserProfileInput from '@/components/user/UserProfileInput.vue'
import { computed } from 'vue'
import { useChangePassword } from '@/utils/user/password'
import { toRef } from 'vue'
import { invalidateProfile } from '@/utils/profile'
import { useChangeEmail } from '@/utils/user/email'

const { t } = useI18n()

withTitle(computed(() => t('pages.user-info')))

const props = defineProps<{ userId: string }>()

const { oldPassword, newPassword, updateTask } = useChangePassword(toRef(props, 'userId'))
const { newEmail, emailCode, sendEmailTask, updateEmailTask } = useChangeEmail(
  toRef(props, 'userId')
)
</script>
<i18n>
en:
  back-to-user-info: Back to user info
  old-password: Old Password
  new-password: New Password
  email-code: Email Code
  action:
    send-email: Send Email
zh-Hans:
  back-to-user-info: 返回用户界面
  old-password: 旧密码
  new-password: 新密码
  email-code: 邮箱验证码
  action:
    send-email: 发送邮件
</i18n>
