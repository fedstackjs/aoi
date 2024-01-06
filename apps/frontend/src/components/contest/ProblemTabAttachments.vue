<template>
  <VCard flat>
    <VTable>
      <thead>
        <tr>
          <th>{{ t('term.filename') }}</th>
          <th>{{ t('term.description') }}</th>
          <th>{{ t('term.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="file in problem.attachments" :key="file.key">
          <td>
            <VIcon icon="mdi-file-outline"></VIcon>
            {{ file.name || file.key }}
          </td>
          <td>{{ file.description }}</td>
          <td>
            <VBtn variant="plain" icon="mdi-download" @click="downloadFile(file.key)" />
          </td>
        </tr>
      </tbody>
    </VTable>
  </VCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { http } from '@/utils/http'
import type { IContestProblemDTO } from './types'

const { t } = useI18n()

const props = defineProps<{
  contestId: string
  problem: IContestProblemDTO
}>()

async function downloadFile(key: string) {
  key = encodeURIComponent(key)
  const resp = await http.get(
    `contest/${props.contestId}/problem/${props.problem._id}/attachment/${key}/url/download`
  )
  const { url } = await resp.json<{ url: string }>()
  window.open(url)
}
</script>
