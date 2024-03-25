<template>
  <VCard flat :title="t('term.content')">
    <VCardText>
      <VTextField v-model="model.title" :label="t('term.title')" />
      <VTextField v-model="model.slug" :label="t('term.slug')" />
      <MarkdownEditor v-model="model.description">
        <template #title>
          <VCardSubtitle>
            {{ t('term.content') }}
            <VIcon>mdi-language-markdown-outline</VIcon>
          </VCardSubtitle>
        </template>
      </MarkdownEditor>
      <VCombobox v-model="model.tags" :label="t('term.tags')" multiple chips />
    </VCardText>
    <VDivider />
    <VCardActions>
      <VBtn color="error" variant="elevated" @click="reset">
        {{ t('action.reset') }}
      </VBtn>
      <VBtn color="primary" variant="elevated" @click="save">
        {{ t('action.save') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

import MarkdownEditor from '@/components/utils/MarkdownEditor.vue'
import { useAppData } from '@/utils/app/inject'
import { http } from '@/utils/http'

const props = defineProps<{
  orgId: string
  appId: string
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
const model = reactive({
  title: '',
  slug: '',
  description: '',
  tags: [] as string[]
})

const app = useAppData()

function reset() {
  model.title = app.value.title
  model.slug = app.value.slug
  model.description = app.value.description
  model.tags = app.value.tags
}

reset()

async function save() {
  await http.patch(`app/${app.value._id}/content`, {
    json: model
  })
  emit('updated')
}
</script>
