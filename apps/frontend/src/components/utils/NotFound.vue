<template>
  <VContainer class="fill-height">
    <VRow justify="center" align="center">
      <VCol lg="4" xl="3">
        <VCard variant="text">
          <VCardTitle class="text-center">
            <div>
              <VAvatar size="180" rounded="0">
                <AppLogo />
              </VAvatar>
            </div>
          </VCardTitle>
          <VAlert type="warning" title="404" :text="t('pages.not-found')" />
          <VCardActions class="justify-center">
            <VBtn
              variant="tonal"
              color="blue"
              rounded="0"
              prepend-icon="mdi-arrow-left"
              :text="t('action.back')"
              @click="router.back()"
            />
            <VBtn
              variant="tonal"
              color="green"
              rounded="0"
              prepend-icon="mdi-home"
              :text="t('pages.home')"
              to="/"
            />
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppLogo from '../app/AppLogo.vue'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
</script>
