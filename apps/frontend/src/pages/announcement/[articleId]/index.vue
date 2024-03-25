<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between">
      <div>
        <p class="text-h4">{{ article.title }}</p>
        <p class="text-subtitle-2 ml-2 mt-3">{{ fmtDate(article.date) }}</p>
      </div>
      <div class="justify-end">
        <VBtn
          variant="text"
          icon="mdi-cog-outline"
          v-if="isAdmin"
          :to="`/announcement/${props.articleId}/edit`"
        />
      </div>
    </VCardTitle>
    <VDivider />
    <MarkdownRenderer :md="article.description" class="pa-4" />
  </VCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { fmtDate } from '@/components/announcement/fmtdate'
import MarkdownRenderer from '@/components/utils/MarkdownRenderer.vue'
import { useUserCapability } from '@/utils/capability'
import { withTitle } from '@/utils/title'

const { t } = useI18n()
const props = defineProps<{
  articleId: string
  article: {
    title: string
    public: boolean
    date: string
    description: string
  }
}>()

const isAdmin = useUserCapability('admin')

withTitle(computed(() => t('pages.announcements')))
</script>
