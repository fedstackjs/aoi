<template>
  <VContainer class="fill-height">
    <VRow justify="center" align="center">
      <VCol lg="4" xl="3">
        <VCard variant="text">
          <VCardTitle class="text-center">
            <VIcon size="128">
              <AoiLogo />
            </VIcon>
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
          <VAlert
            v-if="verifyHint"
            type="info"
            class="ma-4 mb-0 u-whitespace-pre"
            :text="verifyHint"
          />
          <RouterView />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import AoiLogo from '@/components/aoi/AoiLogo.vue'
import { useAppState, useMfa } from '@/stores/app'
import { verifyHint } from '@/utils/flags'
import { withI18nTitle } from '@/utils/title'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const appState = useAppState()
const { hasMfaToken } = useMfa()
withI18nTitle('pages.verify')

if (!appState.loggedIn) router.replace('/auth/login')
if (hasMfaToken.value) router.replace('/')

const isRoot = computed(() => /^\/auth\/verify\/?$/.test(route.path))
</script>
