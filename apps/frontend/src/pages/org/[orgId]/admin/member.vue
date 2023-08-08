<template>
  <VCard variant="flat">
    <VCardTitle class="d-flex justify-space-between align-center">
      <div>{{ t('members') }}</div>
      <div class="flex-grow-1 u-max-w-64">
        <VTextField
          v-model="newMember"
          density="compact"
          label="UserId"
          append-icon="mdi-plus"
          @click:append="addMember"
        />
      </div>
    </VCardTitle>
    <VDataTableServer
      :headers="headers"
      :items-length="groups.state.value.total"
      :items="groups.state.value.items"
      :items-per-page="15"
      :items-per-page-options="[{ title: '15', value: 15 }]"
      :loading="groups.isLoading.value"
      item-value="_id"
      @update:options="({ page, itemsPerPage }) => groups.execute(0, page, itemsPerPage)"
    >
      <template v-slot:[`item._id`]="{ item }">
        <code>{{ item.raw._id }}</code>
      </template>
      <template v-slot:[`item.profile`]="{ item }">
        <RouterLink :to="`/user/${item.raw.user._id}`">
          <VAvatar>
            <AppGravatar :email="item.raw.user.profile.email" />
          </VAvatar>
          <code class="u-pl-2">{{ item.raw.user.profile.username }}</code>
        </RouterLink>
      </template>
      <template v-slot:[`item._cap`]="{ item }">
        <MemberCapabilities :capability="item.raw.capability" />
      </template>
      <template v-slot:[`item._actions`]="{ item }">
        <VBtn icon="mdi-delete" variant="text" @click="deleteMember(item.raw.user._id)" />
      </template>
    </VDataTableServer>
  </VCard>
</template>

<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/components'
import { http } from '@/utils/http'
import { withTitle } from '@/utils/title'
import { useAsyncState } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppGravatar from '@/components/app/AppGravatar.vue'
import MemberCapabilities from '@/components/org/MemberCapabilities.vue'

const props = defineProps<{
  orgId: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('members')))

const headers = [
  { title: 'Profile', key: 'profile', align: 'start', sortable: false },
  { title: 'ID', key: '_id' },
  { title: 'Capabilities', key: '_cap' },
  { title: 'Actions', key: '_actions' }
] as const

const groups = useAsyncState(
  async (page = 1, itemsPerPage = 15) => {
    const resp = await http.get(`org/${props.orgId}/admin/member`, {
      searchParams: {
        page: page,
        perPage: itemsPerPage,
        count: true
      }
    })

    return resp.json<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: any[]
      total: number
    }>()
  },
  { items: [], total: 0 }
)

async function deleteMember(userId: string) {
  await http.delete(`org/${props.orgId}/admin/member/${userId}`)
  groups.execute()
}

const newMember = ref('')
async function addMember() {
  await http.post(`org/${props.orgId}/admin/member`, {
    json: {
      userId: newMember.value
    }
  })
  groups.execute()
  newMember.value = ''
}
</script>
