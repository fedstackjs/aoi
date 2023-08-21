<template>
  <VCard variant="flat" :title="t('add-ranklist')">
    <VCardText>
      <VTextField label="Key" v-model="payload.key" />
      <VTextField label="Name" v-model="payload.name" />
    </VCardText>
    <VCardActions>
      <VBtn color="primary" variant="elevated" @click="addRanklist()">
        {{ t('add') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import type { IContestDTO } from '@/components/contest/types'
import { http } from '@/utils/http'
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

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
  try {
    const { orgId, contestId } = props
    await http.post(`contest/${contestId}/ranklist`, {
      json: payload
    })
    router.replace(`/org/${orgId}/contest/${contestId}/ranklist/${payload.key}`)
    emit('updated')
  } catch (err) {
    toast.error(`Error: ${err}`)
  }
}
</script>
