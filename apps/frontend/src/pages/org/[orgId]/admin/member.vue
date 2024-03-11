<template>
  <VCard variant="flat">
    <VCardTitle class="d-flex justify-space-between align-center">
      <div>{{ t('term.members') }}</div>
      <div class="flex-grow-1 u-max-w-64">
        <UserIdInput
          v-model="newMember"
          :label="t('term.user-id')"
          density="compact"
          append-icon="mdi-plus"
          @click:append="addMember"
        />
      </div>
    </VCardTitle>
    <VDataTableServer
      :headers="headers"
      :items-length="members.state.value.total"
      :items="members.state.value.items"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      :items-per-page-options="[15, 30, 50, 100]"
      :loading="members.isLoading.value"
      item-value="_id"
      @update:options="({ page, itemsPerPage }) => members.execute(0, page, itemsPerPage)"
    >
      <template v-slot:[`item._id`]="{ item }">
        <code>{{ item.user._id }}</code>
      </template>
      <template v-slot:[`item.profile`]="{ item }">
        <RouterLink :to="`/user/${item.user._id}`">
          <VAvatar>
            <AoiGravatar :email="item.user.profile.email" />
          </VAvatar>
          <code class="u-pl-2">{{ item.user.profile.name }}</code>
        </RouterLink>
      </template>
      <template v-slot:[`item._cap`]="{ item }">
        <CapabilityChips :bits="orgBits" :capability="item.capability" />
      </template>
      <template v-slot:[`item._actions`]="{ item }">
        <VBtn icon="mdi-delete" variant="text" @click="deleteMember(item.user._id)" />
        <VBtn
          icon="mdi-pencil"
          variant="text"
          @click="openDialog(item.user._id, item.capability)"
        />
      </template>
    </VDataTableServer>
    <VDialog v-model="dialog" width="auto">
      <VCard>
        <VCardText>
          <CapabilityInput v-model="dialogCapability" :bits="orgBits" />
        </VCardText>
        <VCardActions>
          <VBtn color="primary" @click="updatePrincipal">{{ t('action.update') }}</VBtn>
          <VBtn color="error" @click="dialog = false">{{ t('action.cancel') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script setup lang="ts">
import { http } from '@/utils/http'
import { orgBits } from '@/utils/capability'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePagination } from '@/utils/pagination'
import AoiGravatar from '@/components/aoi/AoiGravatar.vue'
import CapabilityInput from '@/components/utils/CapabilityInput.vue'
import CapabilityChips from '@/components/utils/CapabilityChips.vue'
import UserIdInput from '@/components/utils/UserIdInput.vue'

const props = defineProps<{
  orgId: string
}>()

const { t } = useI18n()

const headers = [
  { title: t('term.profile'), key: 'profile', align: 'start', sortable: false },
  { title: t('term.id'), key: '_id' },
  { title: t('term.capabilities'), key: '_cap' },
  { title: t('term.actions'), key: '_actions' }
] as const

const {
  page,
  itemsPerPage,
  result: members
} = usePagination<{
  user: {
    _id: string
    profile: {
      name: string
      email: string
    }
  }
  capability: string
}>(`org/${props.orgId}/admin/member`, {})

async function deleteMember(userId: string) {
  await http.delete(`org/${props.orgId}/admin/member/${userId}`)
  members.execute(0, page.value, itemsPerPage.value)
}

const newMember = ref('')
async function addMember() {
  await http.post(`org/${props.orgId}/admin/member`, {
    json: {
      userId: newMember.value
    }
  })
  members.execute(0, page.value, itemsPerPage.value)
  newMember.value = ''
}

const dialog = ref(false)
const dialogUserId = ref('')
const dialogCapability = ref('')

function openDialog(userId: string, capability: string) {
  dialogUserId.value = userId
  dialogCapability.value = capability
  dialog.value = true
}

async function updatePrincipal() {
  dialog.value = false
  await http.patch(`org/${props.orgId}/admin/member/${dialogUserId.value}/capability`, {
    json: { capability: dialogCapability.value }
  })
  members.execute(0, page.value, itemsPerPage.value)
}
</script>
