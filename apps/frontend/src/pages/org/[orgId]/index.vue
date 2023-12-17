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
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppState } from '@/stores/app'
import PosterCarousel from '@/components/homepage/PosterCarousel.vue'
import RecentContestsCard from '@/components/homepage/RecentContestsCard.vue'
import AnnouncementsCard from '@/components/homepage/AnnouncementsCard.vue'
import FriendLinksCard from '@/components/homepage/FriendLinksCard.vue'

const { t } = useI18n()
const appState = useAppState()

withTitle(computed(() => t('pages.home')))
</script>
