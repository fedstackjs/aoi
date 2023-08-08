<template>
  <VCard flat :title="t('problem-content')">
    <VCardText>
      <VTextField v-model="model.title" label="Title" />
      <VTextField v-model="model.slug" label="slug" />
      <VCardSubtitle>
        Content
        <VIcon>mdi-language-markdown-outline</VIcon>
      </VCardSubtitle>
      <MonacoEditor v-model="model.description" language="markdown" />
      <VCombobox v-model="model.tags" label="Tags" multiple chips />
    </VCardText>
    <VDivider />
    <VCardActions>
      <VBtn color="error" variant="elevated" @click="reset">
        {{ t('reset') }}
      </VBtn>
      <VBtn color="primary" variant="elevated" @click="save">
        {{ t('save') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IProblemDTO } from '../types'
import { http } from '@/utils/http'
import MonacoEditor from '@/components/utils/MonacoEditor.vue'

const props = defineProps<{
  problem: IProblemDTO
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

function reset() {
  model.title = props.problem.title
  model.slug = props.problem.slug
  model.description = props.problem.description
  model.tags = props.problem.tags
}

reset()

async function save() {
  await http.patch(`problem/${props.problem._id}/content`, {
    json: model
  })
  emit('updated')
}
</script>
