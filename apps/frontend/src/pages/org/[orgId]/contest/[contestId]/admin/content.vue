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
import { http } from '@/utils/http'
import MonacoEditor from '@/components/utils/MonacoEditor.vue'
import type { IContestDTO } from '@/components/contest/types'

const props = defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
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
  model.title = props.contest.title
  model.slug = props.contest.slug
  model.description = props.contest.description
  model.tags = props.contest.tags
}

reset()

async function save() {
  await http.patch(`contest/${props.contest._id}/content`, {
    json: model
  })
  emit('updated')
}
</script>
