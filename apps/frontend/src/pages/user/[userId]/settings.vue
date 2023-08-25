<template>
  <VCard>
    <VCardActions>
      <VBtn variant="text" prepend-icon="mdi-chevron-left" :to="`/user/${props.userId}`">
        {{ t('back-to-user-info') }}
      </VBtn>
    </VCardActions>
    <VDivider />
    <SettingsEditor :endpoint="`user/${props.userId}/profile`">
      <template v-slot="scoped">
        <UserProfileInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
    <VDivider />
    <VCardText>
      <VTextField v-model="oldPassword" label="Old Password" type="password" />
      <VTextField v-model="newPassword" label="New Password" type="password" />
    </VCardText>
    <VCardActions>
      <VBtn variant="elevated" @click="updateTask.execute()" :loading="updateTask.isLoading.value">
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

const { t } = useI18n()

withTitle(computed(() => t('pages.user-info')))

const props = defineProps<{ userId: string }>()

const { oldPassword, newPassword, updateTask } = useChangePassword(toRef(props, 'userId'))
</script>
<i18n>
en:
  back-to-user-info: Back to user info
zh-Hans:
  back-to-user-info: 返回用户界面
</i18n>
