<template>
  <VContainer>
    <VRow justify="center">
      <VCol cols="12" xl="6">
        <PosterCarousel />
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <RecentContestsCard />
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <AnnouncementsCard />
      </VCol>
      <VCol>
        <FriendLinksCard />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PosterCarousel from '@/components/homepage/PosterCarousel.vue'
import AnnouncementsCard from '@/components/homepage/AnnouncementsCard.vue'
import FriendLinksCard from '@/components/homepage/FriendLinksCard.vue'
import RecentContestsCard from '@/components/homepage/RecentContestsCard.vue'

const { t } = useI18n()

withTitle(computed(() => t('pages.home')))
</script>
