<template>
  <VContainer>
    <VRow>
      <VCol>
        <PosterCarousel />
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <RecentContestsCard :org-id="appState.orgId" />
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <AnnouncementsCard />
      </VCol>
      <VCol>
        <VContainer class="pa-0">
          <VRow>
            <VCol>
              <FriendLinksCard />
            </VCol>
          </VRow>
        </VContainer>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import AnnouncementsCard from '@/components/homepage/AnnouncementsCard.vue'
import FriendLinksCard from '@/components/homepage/FriendLinksCard.vue'
import PosterCarousel from '@/components/homepage/PosterCarousel.vue'
import RecentContestsCard from '@/components/homepage/RecentContestsCard.vue'
import { useAppState } from '@/stores/app'
import { withTitle } from '@/utils/title'

const { t } = useI18n()
const appState = useAppState()

withTitle(computed(() => t('pages.org-home')))
</script>
