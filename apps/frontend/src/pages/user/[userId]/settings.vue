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
    <UserAuth :userId="userId" />
  </VCard>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { useI18n } from 'vue-i18n'
import SettingsEditor from '@/components/utils/SettingsEditor.vue'
import UserProfileInput from '@/components/user/UserProfileInput.vue'
import { computed } from 'vue'
import { invalidateProfile } from '@/utils/profile'
import UserAuth from '@/components/user/UserAuth.vue'

const { t } = useI18n()

withTitle(computed(() => t('pages.user-info')))

const props = defineProps<{ userId: string }>()
</script>

<i18n>
en:
  back-to-user-info: Back to user info
zh-Hans:
  back-to-user-info: 返回用户界面
</i18n>
