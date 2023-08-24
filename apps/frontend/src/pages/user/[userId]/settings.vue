<template>
  <VCard>
    <SettingsEditor :endpoint="`user/${props.userId}/profile`">
      <template v-slot="scoped">
        <UserProfileInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
    <VCardActions>
      <VBtn variant="text" prepend-icon="mdi-chevron-left" :to="`/user/${props.userId}`">
        {{ t('back-to-user-info') }}
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

const { t } = useI18n()

withTitle(computed(() => t('pages.user-info')))

const props = defineProps<{ userId: string }>()
</script>
<i18n>
en:
  back-to-user-info: Back to user info
zhHans:
  back-to-user-info: 返回用户界面
</i18n>
