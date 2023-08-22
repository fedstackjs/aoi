<template>
  <VCard>
    <SettingsEditor :endpoint="`user/${props.userId}/profile`">
      <template v-slot="scoped">
        <UserProfileInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
    <VCardActions>
      <VBtn
        variant="text"
        prepend-icon="mdi-chevron-left"
        :to="`user/${props.userId}`"
        :label="t('back-to-user-info')"
      />
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

withTitle(computed(() => t('user-info')))

const props = defineProps<{ userId: string }>()
</script>
