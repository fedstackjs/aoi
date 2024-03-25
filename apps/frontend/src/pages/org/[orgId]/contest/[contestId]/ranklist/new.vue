<template>
  <VCard variant="flat" :title="t('add-ranklist')">
    <VCardText>
      <VTextField :label="t('term.key')" v-model="payload.key" />
      <VTextField :label="t('term.name')" v-model="payload.name" />
    </VCardText>
    <VCardActions>
      <VBtn color="primary" variant="elevated" @click="addRanklist()">
        {{ t('action.add') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import type { IContestDTO } from '@/components/contest/types'
import { http } from '@/utils/http'

const props = defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
  ranklists: [{ key: string; name: string }]
}>()
const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

const payload = reactive({
  key: '',
  name: ''
})

async function addRanklist() {
  if (payload.key === '' || payload.name === '') {
    toast.error('Key and name cannot be empty')
    return
  }
  try {
    const { orgId, contestId } = props
    await http.post(`contest/${contestId}/ranklist`, {
      json: payload
    })
    router.replace(`/org/${orgId}/contest/${contestId}/ranklist/${encodeURIComponent(payload.key)}`)
    emit('updated')
  } catch (err) {
    toast.error(`Error: ${err}`)
  }
}
</script>
<i18n>
en:
  add-ranklist: Add ranklist
zh-Hans:
  add-ranklist: 创建排行榜
</i18n>
