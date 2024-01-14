<template>
  <VContainer class="fill-height">
    <VRow justify="center" align="center">
      <VCol lg="4" xl="3">
        <VCard>
          <VCardTitle>
            {{ t('pages.signin') }}
          </VCardTitle>
          <VDivider />
          <RouterView />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAppState } from '@/stores/app'
import { useRouter, useRoute } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const appState = useAppState()

if (appState.loggedIn) router.replace('/')
</script>
