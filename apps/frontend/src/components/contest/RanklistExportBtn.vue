<template>
  <VBtn
    prepend-icon="mdi-download"
    @click="execute"
    :loading="loading"
    variant="elevated"
    color="primary"
  >
    {{ t('action.export') }}
  </VBtn>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { http } from '@/utils/http'
import { useToast } from 'vue-toastification'
import * as xlsx from 'xlsx'
import type { Ranklist } from '@aoi-js/common'
import type { IUserProfile } from '@aoi-js/server'
import ky from 'ky'

const { t } = useI18n()
const toast = useToast()

const props = defineProps<{
  contestId: string
  ranklistKey: string
}>()
const loading = ref(false)

async function getProfile(_id: string) {
  const endpoint = `user/${_id}/profile`
  const profile = await http.get(endpoint).json<IUserProfile>()
  return profile
}

async function exportRanklist() {
  toast.info(t('start-generating'))
  try {
    const endpoint = `contest/${props.contestId}/ranklist/${props.ranklistKey}/url/download`
    const { url } = await http.get(endpoint).json<{ url: string }>()
    const jsondata = await ky.get(url).json<Ranklist>()
    const workbook = xlsx.utils.book_new()
    var data = []
    const header = [
      t('term.rank'),
      t('term.username'),
      t('term.tags'),
      t('term.email'),
      t('term.realname'),
      t('term.telephone'),
      t('term.school'),
      t('term.student-grade'),
      ...jsondata.participant.columns.map((column) => column.name)
    ]
    data.push(header)
    for (let i = 0; i < jsondata.participant.list.length; i++) {
      const participant = jsondata.participant.list[i]
      const profile = await getProfile(participant.userId)
      const row = [
        participant.rank,
        profile.name,
        participant.tags?.map((tag) => tag.replace(/^![^:]+:/, '')).join(',') ?? '',
        profile.email,
        profile.realname,
        profile.telephone,
        profile.school,
        profile.studentGrade,
        ...participant.columns.map((column) => column.content)
      ]
      data.push(row)
    }
    const sheet = xlsx.utils.aoa_to_sheet(data)
    xlsx.utils.book_append_sheet(workbook, sheet, 'Ranklist')
    toast.success(t('successfully-generated'))
    // Write to a blob and download the file
    xlsx.writeFile(workbook, 'ranklist.xlsx')
  } catch (e) {
    const msg = e as string
    toast.error(t('failed-to-generate') + ': ' + msg)
  }
}

async function execute() {
  loading.value = true
  await exportRanklist()
  loading.value = false
}
</script>
<i18n>
en:
  start-generating: Start generating
  successfully-generated: Successfully generated
  failed-to-generate: Failed to generate
zh-Hans:
  start-generating: 开始生成
  successfully-generated: 成功生成
  failed-to-generate: 生成失败
</i18n>
