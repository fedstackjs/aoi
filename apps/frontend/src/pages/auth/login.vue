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
            <div>
              {{ t('pages.signin') }}
            </div>
            <VBtn
              v-if="!isRoot"
              variant="tonal"
              prepend-icon="mdi-arrow-left"
              :text="t('action.back')"
              :to="{ path: '/auth/login', query: route.query }"
            />
          </VCardTitle>
          <VDivider />
          <VAlert v-if="hint" type="info" class="ma-4 mb-0 u-whitespace-pre" :text="hint" />
          <RouterView />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAppState } from '@/stores/app'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { withI18nTitle } from '@/utils/title'
import AppLogo from '@/components/app/AppLogo.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const appState = useAppState()
withI18nTitle('pages.signin')

if (appState.loggedIn) router.replace('/')

const hint = import.meta.env.VITE_LOGIN_HINT
const isRoot = computed(() => /^\/auth\/login\/?$/.test(route.path))
</script>
