<template>
  <VCard flat>
    <VCardTitle class="d-flex justify-space-between align-center">
      <div>{{ t('associations') }}</div>
      <div class="flex-grow-1 u-max-w-64">
        <VTextField
          v-model="newPrincipalId"
          density="compact"
          label="UserId"
          append-icon="mdi-plus"
          @click:append="addPrinciple"
        />
      </div>
    </VCardTitle>
    <VDataTable
      :headers="headers"
      :items="associations.state.value"
      :loading="associations.isLoading.value"
      item-value="_id"
    >
      <template v-slot:[`item.profile`]="{ item }">
        <PrincipalProfile :principalId="item.raw.principalId" />
      </template>
      <template v-slot:[`item._cap`]="{ item }">
        <CapabilityChips :capability="item.raw.capability" :bits="bits" />
      </template>
      <template v-slot:[`item._actions`]="{ item }">
        <VBtn icon="mdi-delete" variant="text" @click="deletePrinciple(item.raw.principalId)" />
        <VBtn
          icon="mdi-pencil"
          variant="text"
          @click="openDialog(item.raw.principalId, item.raw.capability)"
        />
      </template>
    </VDataTable>
    <VDialog v-model="dialog" width="auto">
      <VCard>
        <VCardText>
          <CapabilityInput v-model="dialogCapability" :bits="bits" />
        </VCardText>
        <VCardActions>
          <VBtn color="primary" @click="updatePrincipal">{{ t('update') }}</VBtn>
          <VBtn color="error" @click="dialog = false">{{ t('cancel') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script setup lang="ts">
import { VDataTable } from 'vuetify/labs/components'
import { useAsyncState } from '@vueuse/core'
import { http } from '@/utils/http'
import type { IAssociation } from '@/types'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import CapabilityChips from './CapabilityChips.vue'
import PrincipalProfile from './PrincipalProfile.vue'
import CapabilityInput from './CapabilityInput.vue'

const props = defineProps<{
  prefix: string
  bits: Record<string, number>
}>()

const { t } = useI18n()

const headers = [
  { title: 'Profile', key: 'profile', align: 'start', sortable: false },
  { title: 'Capabilities', key: '_cap' },
  { title: 'Actions', key: '_actions' }
] as const

const associations = useAsyncState(async () => {
  const resp = await http.get(`${props.prefix}`)
  return resp.json<IAssociation[]>()
}, [])

const newPrincipalId = ref('')

async function addPrinciple() {
  await http.post(`${props.prefix}`, {
    json: { principalId: newPrincipalId.value }
  })
  newPrincipalId.value = ''
  associations.execute()
}

async function deletePrinciple(principalId: string) {
  await http.delete(`${props.prefix}/${principalId}`)
  associations.execute()
}

const dialog = ref(false)
const dialogPrincipalId = ref('')
const dialogCapability = ref('')

function openDialog(principalId: string, capability: string) {
  dialogPrincipalId.value = principalId
  dialogCapability.value = capability
  dialog.value = true
}

async function updatePrincipal() {
  dialog.value = false
  await http.patch(`${props.prefix}/${dialogPrincipalId.value}`, {
    json: { capability: dialogCapability.value }
  })
  associations.execute()
}
</script>
