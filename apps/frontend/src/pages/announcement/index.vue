<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard>
          <VCardTitle class="d-flex align-center">
            <div>
              {{ t('pages.announcements') }}
            </div>
            <VSpacer />
            <VBtn variant="text" icon="mdi-plus" to="/announcement/new" v-if="isAdmin" />
          </VCardTitle>
          <AnnouncementList />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AnnouncementList from '@/components/announcement/AnnouncementList.vue'
import { useUserCapability } from '@/utils/capability'

const { t } = useI18n()
const isAdmin = useUserCapability('admin')

withTitle(computed(() => t('pages.announcements')))
</script>
