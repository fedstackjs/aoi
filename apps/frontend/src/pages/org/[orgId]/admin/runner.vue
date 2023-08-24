<template>
  <VCard variant="flat">
    <VCardTitle class="d-flex justify-space-between">
      <div>{{ t('term.runners') }}</div>
      <VDialog width="auto">
        <template v-slot:activator="{ props }">
          <VBtn color="primary" v-bind="props" :text="t('action.register')" />
        </template>

        <VCard :title="t('action.register')">
          <VCardText>
            <AsyncState :state="registrationToken">
              <template v-slot="{ value }">
                <VTextarea readonly dense :model-value="value" class="u-font-mono" />
              </template>
            </AsyncState>
          </VCardText>
          <VCardActions>
            <VBtn
              color="primary"
              @click="registrationToken.execute()"
              :text="t('action.refresh')"
            />
            <VBtn
              color="primary"
              @click="copyTask.execute()"
              :loading="copyTask.isLoading.value"
              :text="t('action.copy')"
            />
          </VCardActions>
        </VCard>
      </VDialog>
    </VCardTitle>
    <AsyncState :state="runners">
      <template v-slot="{ value }">
        <VDataTable :headers="headers" :items="value" item-value="_id">
          <template v-slot:[`item._id`]="{ item }">
            <code>{{ item.raw._id }}</code>
          </template>
          <template v-slot:[`item.createdAt`]="{ item }">
            <code>{{ new Date(item.raw.createdAt).toLocaleString() }}</code>
          </template>
          <template v-slot:[`item.accessedAt`]="{ item }">
            <code>{{ new Date(item.raw.accessedAt).toLocaleString() }}</code>
          </template>
          <template v-slot:[`item._labels`]="{ item }">
            <VChipGroup>
              <VChip v-for="label in item.raw.labels" :key="label" small>
                {{ label }}
              </VChip>
            </VChipGroup>
          </template>
        </VDataTable>
      </template>
    </AsyncState>
  </VCard>
</template>

<script setup lang="ts">
import { VDataTable } from 'vuetify/labs/components'
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import type { IRunner } from '@/types'
import AsyncState from '@/components/utils/AsyncState.vue'
import { useAsyncTask } from '@/utils/async'

const props = defineProps<{
  orgId: string
}>()

const { t } = useI18n()
const runners = useAsyncState(async () => {
  return http.get(`org/${props.orgId}/admin/runner`).json<IRunner[]>()
}, [])
const registrationToken = useAsyncState(async () => {
  const { registrationToken } = await http.post(`org/${props.orgId}/admin/runner/register`).json<{
    registrationToken: string
  }>()
  return registrationToken
}, '')
const copyTask = useAsyncTask(async () => {
  await navigator.clipboard.writeText(registrationToken.state.value)
})

const headers = [
  { title: t('ID'), key: '_id' },
  { title: t('term.name'), key: 'name' },
  { title: t('common.created-at'), key: 'createdAt' },
  { title: t('common.accessed-at'), key: 'accessedAt' },
  { title: t('term.labels'), key: '_labels' },
  { title: t('term.actions'), key: '_actions' }
] as const
</script>
