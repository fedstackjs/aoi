<template>
  <VCard flat :title="t('problem-content')">
    <VCardText>
      <VTextField v-model="model.title" label="Title" />
      <VTextField v-model="model.slug" label="slug" />
      <MarkdownEditor v-model="model.description">
        <template #title>
          <VCardSubtitle>
            Content
            <VIcon>mdi-language-markdown-outline</VIcon>
          </VCardSubtitle>
        </template>
      </MarkdownEditor>
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
import type { IProblemDTO } from '@/components/problem/types'
import { http } from '@/utils/http'
import MarkdownEditor from '@/components/utils/MarkdownEditor.vue'

const props = defineProps<{
  orgId: string
  problemId: string
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
