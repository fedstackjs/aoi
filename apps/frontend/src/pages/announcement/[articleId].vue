<template>
  <VContainer>
    <VRow>
      <VCol>
        <AsyncState :state="article" hide-when-loading>
          <template v-slot="{ value }">
            <RouterView :article="value" @updated="article.execute()" />
          </template>
        </AsyncState>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAsyncState } from '@vueuse/core'
import { http } from '@/utils/http'
import AsyncState from '@/components/utils/AsyncState.vue'

const { t } = useI18n()
const props = defineProps<{
  articleId: string
}>()

withTitle(computed(() => t('pages.announcements')))

const article = useAsyncState(async () => {
  const resp = await http.get(`announcement/${props.articleId}`)
  return await resp.json<{
    title: string
    public: boolean
    date: string
    description: string
  }>()
}, null as never)
</script>
