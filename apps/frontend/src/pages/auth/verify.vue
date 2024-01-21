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
              {{ t('pages.verify') }}
            </div>
            <VBtn
              v-if="!isRoot"
              variant="tonal"
              prepend-icon="mdi-arrow-left"
              :text="t('action.back')"
              :to="{ path: '/auth/verify', query: route.query }"
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
import { useAppState, useMfa } from '@/stores/app'
import { useRoute, useRouter } from 'vue-router'
import AppLogo from '@/components/app/AppLogo.vue'
import { withI18nTitle } from '@/utils/title'
import { computed } from 'vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const appState = useAppState()
const { hasMfaToken } = useMfa()
withI18nTitle('pages.verify')

if (!appState.loggedIn) router.replace('/login')
if (hasMfaToken.value) router.replace('/')

const hint = import.meta.env.VITE_VERIFY_HINT
const isRoot = computed(() => /^\/auth\/verify\/?$/.test(route.path))
</script>
