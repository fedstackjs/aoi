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
        <code>{{ item._id }}</code>
      </template>
      <template v-slot:[`item.profile`]="{ item }">
        <RouterLink :to="`/user/${item._id}`">
          <VAvatar>
            <AppGravatar :email="item.profile.email" />
          </VAvatar>
          <code class="u-pl-2">{{ item.profile.name }}</code>
        </RouterLink>
      </template>
      <template v-slot:[`item._cap`]="{ item }">
        <CapabilityChips :bits="userBits" :capability="item.capability ?? '0'" />
      </template>
      <template v-slot:[`item._namespace`]="{ item }">
        <code>{{ item.namespace }}</code>
      </template>
      <template v-slot:[`item._tags`]="{ item }">
        <code>{{ item.tags?.join(', ') }}</code>
      </template>
      <template v-slot:[`item._actions`]="{ item }">
        <VBtn
          icon="mdi-pencil-outline"
          variant="text"
          @click="openDialog(item._id, item.capability ?? '0')"
        />
        <VBtn icon="mdi-cog-outline" variant="text" :to="`/user/${item._id}/settings`" />
        <VBtn
          v-if="appState.userCapability === '-1'"
          icon="mdi-login-variant"
          variant="text"
          @click="loginAs.execute(item._id)"
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
import { useAppState } from '@/stores/app'
import { useAsyncTask } from '@/utils/async'
import { userBits } from '@/utils/capability'
import { http, login, logout } from '@/utils/http'
import { usePagination } from '@/utils/pagination'
import { useRouteQuery } from '@vueuse/router'
import { computed } from 'vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const headers = [
  { title: 'Profile', key: 'profile', align: 'start', sortable: false },
  { title: 'ID', key: '_id' },
  { title: 'Capabilities', key: '_cap' },
  { title: 'Namespace', key: '_namespace' },
  { title: 'Tags', key: '_tags' },
  { title: 'Actions', key: '_actions' }
] as const

const search = useRouteQuery('search', '')

const {
  page,
  itemsPerPage,
  result: users
} = usePagination<{
  _id: string
  profile: {
    name: string
    email: string
  }
  capability?: string
  namespace?: string
  tags?: string[]
}>(
  `admin/user`,
  computed(() => ({ search: search.value || undefined }))
)

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

const router = useRouter()
const appState = useAppState()

const loginAs = useAsyncTask(async (userId: string) => {
  const { token } = await http
    .post(`admin/user/login`, { json: { userId } })
    .json<{ token: string }>()
  await router.replace('/')
  logout()
  login(token)
})
</script>
