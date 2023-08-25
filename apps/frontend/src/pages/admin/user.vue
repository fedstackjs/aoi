<template>
  <VCard title="Users" variant="flat">
    <VDataTableServer
      :headers="headers"
      :items-length="users.state.value.total"
      :items="users.state.value.items"
      :items-per-page-options="[{ title: '15', value: 15 }]"
      :loading="users.isLoading.value"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      item-value="_id"
      @update:options="({ page, itemsPerPage }) => users.execute(0, page, itemsPerPage)"
    >
      <template v-slot:[`item._id`]="{ item }">
        <code>{{ item.raw._id }}</code>
      </template>
      <template v-slot:[`item.profile`]="{ item }">
        <RouterLink :to="`/user/${item.raw._id}`">
          <VAvatar>
            <AppGravatar :email="item.raw.profile.email" />
          </VAvatar>
          <code class="u-pl-2">{{ item.raw.profile.name }}</code>
        </RouterLink>
      </template>
      <template v-slot:[`item._cap`]="{ item }">
        <CapabilityChips :bits="userBits" :capability="item.raw.capability ?? '0'" />
      </template>
      <template v-slot:[`item._actions`]="{ item }">
        <VBtn
          icon="mdi-pencil"
          variant="text"
          @click="openDialog(item.raw._id, item.raw.capability ?? '0')"
        />
      </template>
    </VDataTableServer>
    <VDialog v-model="dialog" width="auto">
      <VCard>
        <VCardText>
          <CapabilityInput v-model="dialogCapability" :bits="userBits" />
        </VCardText>
        <VCardActions>
          <VBtn color="primary" @click="updatePrincipal">Update</VBtn>
          <VBtn color="error" @click="dialog = false">Cancel</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script setup lang="ts">
import AppGravatar from '@/components/app/AppGravatar.vue'
import CapabilityChips from '@/components/utils/CapabilityChips.vue'
import CapabilityInput from '@/components/utils/CapabilityInput.vue'
import { userBits } from '@/utils/capability'
import { http } from '@/utils/http'
import { usePagination } from '@/utils/pagination'
import { ref } from 'vue'
import { VDataTableServer } from 'vuetify/labs/components'

const headers = [
  { title: 'Profile', key: 'profile', align: 'start', sortable: false },
  { title: 'ID', key: '_id' },
  { title: 'Capabilities', key: '_cap' },
  { title: 'Actions', key: '_actions' }
] as const

const { page, itemsPerPage, result: users } = usePagination(`admin/user`, {})

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
  await http.patch(`admin/user/${dialogUserId.value}/capability`, {
    json: { capability: dialogCapability.value }
  })
  users.execute(0, page.value, itemsPerPage.value)
}
</script>
