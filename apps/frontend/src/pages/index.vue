<template>
  <VContainer>
    <VRow>
      <VCol>
        <PosterCarousel />
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <VContainer class="pa-0">
          <VRow>
            <VCol>
              <AnnouncementsCard />
            </VCol>
          </VRow>
        </VContainer>
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
import { http } from '@/utils/http'
import { useRouter } from 'vue-router'
import { useAppState } from '@/stores/app'
import PosterCarousel from '@/components/homepage/PosterCarousel.vue'
// import SiteLogo from '@/components/homepage/SiteLogo.vue'
// import RecentContestsCard from '@/components/homepage/RecentContestsCard.vue'
// import PlanCard from '@/components/homepage/PlanCard.vue'
import AnnouncementsCard from '@/components/homepage/AnnouncementsCard.vue'
import FriendLinksCard from '@/components/homepage/FriendLinksCard.vue'

const { t } = useI18n()
const router = useRouter()
const appState = useAppState()

withTitle(computed(() => t('pages.home')))

async function autoRedirect() {
  if (!appState.userId) return
  const resp = await http.get(`user/${appState.userId}/first`)
  const { firstLogin } = await resp.json<{ firstLogin: boolean }>()
  if (firstLogin) router.replace('/initial')
}
autoRedirect()
</script>
