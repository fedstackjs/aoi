<template>
  <VCard>
    <VCardActions>
      <VBtn variant="text" prepend-icon="mdi-chevron-left" :to="`/announcement/${props.articleId}`">
        {{ t('back-to-content') }}
      </VBtn>
    </VCardActions>
    <VDivider />
    <VTextField v-model="model.title" :label="t('term.title')" />
    <VCheckbox v-model="model.public" :label="t('is-public')" />
    <VTextField v-model="model.date" :label="t('term.date')" type="datetime-local" />
    <VDivider />
    <MarkdownEditor v-model="model.description">
      <template #title>
        <VCardSubtitle>
          {{ t('term.content') }}
          <VIcon>mdi-language-markdown-outline</VIcon>
        </VCardSubtitle>
      </template>
    </MarkdownEditor>
    <VDivider />
    <VCardActions>
      <VBtn color="error" variant="elevated" @click="reset">
        {{ t('action.reset') }}
      </VBtn>
      <VBtn color="primary" variant="elevated" @click="save">
        {{ t('action.save') }}
      </VBtn>
    </VCardActions>
    <VDivider />
    <VCardSubtitle>
      {{ t('term.danger-zone') }}
    </VCardSubtitle>
    <VBtn color="red" variant="elevated" @click="deleteArticle">
      {{ t('action.delete') }}
    </VBtn>
  </VCard>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import MarkdownEditor from '@/components/utils/MarkdownEditor.vue'
import { http } from '@/utils/http'
import { withTitle } from '@/utils/title'

const { t } = useI18n()

withTitle(computed(() => t('pages.announcements')))

const props = defineProps<{
  articleId: string
  article: {
    title: string
    public: boolean
    date: string
    description: string
  }
}>()
const router = useRouter()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()
const toast = useToast()
const model = reactive({
  title: '',
  public: false,
  date: '',
  description: ''
})

function reset() {
  model.title = props.article.title
  model.date = props.article.date
  model.description = props.article.description
  model.public = props.article.public
}

reset()

async function save() {
  if (model.title === '') return toast.error('Title must not be empty')
  if (Number.isNaN(+new Date(model.date))) return toast.error('Invalid date')

  await http.patch(`announcement/${props.articleId}`, { json: model })
  emit('updated')
}

async function deleteArticle() {
  await http.delete(`announcement/${props.articleId}`)
  router.push(`/announcement`)
  emit('updated')
}
</script>

<i18n>
en:
  back-to-content: Back to content
  is-public: Is Public
zh-Hans:
  back-to-content: 返回内容
  is-public: 是否公开
</i18n>
