<template>
  <VContainer class="fill-height">
    <VRow justify="center" align="center">
      <VCol lg="4" xl="3">
        <VCard>
          <VCardTitle>
            {{ t('pages.signin') }}
          </VCardTitle>
          <VDivider />
          <VAlert v-if="hint" type="info" :text="hint" class="ma-4 mb-0" />
          <RouterView />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAppState } from '@/stores/app'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const appState = useAppState()

if (appState.loggedIn) router.replace('/')

const hint = import.meta.env.VITE_LOGIN_HINT
</script>
