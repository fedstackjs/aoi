<template>
  <VContainer class="fill-height">
    <VRow justify="center" align="center">
      <VCol lg="4" xl="3">
        <VCard variant="text">
          <VCardTitle class="text-center">
            <div>
              <VAvatar size="180" rounded="0">
                <AoiLogo />
              </VAvatar>
            </div>
            <div>{{ t('pages.authorize') }}</div>
          </VCardTitle>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import AoiLogo from '@/components/aoi/AoiLogo.vue'
import { withI18nTitle } from '@/utils/title'

withI18nTitle('pages.authorize')

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
router.replace({
  path: '/oauth/authorize',
  query: {
    client_id: route.query.appId,
    secret: route.query.secret
  }
})
</script>
