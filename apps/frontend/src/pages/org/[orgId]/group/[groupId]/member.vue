<template>
  <VCard variant="flat">
    <VCardTitle class="d-flex justify-space-between align-center">
      <div>{{ t('term.members') }}</div>
      <div class="flex-grow-1 u-max-w-64">
        <UserIdInput
          v-model="newMember"
          density="compact"
          :label="t('term.user-id')"
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
      :items-per-page-options="[15, 30, 50, 100]"
      :loading="groups.isLoading.value"
      item-value="_id"
      @update:options="({ page, itemsPerPage }) => groups.execute(0, page, itemsPerPage)"
    >
      <template v-slot:[`item._id`]="{ item }">
        <code>{{ item._id }}</code>
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
        <CapabilityChips :capability="item.capability" :bits="orgBits" />
      </template>
      <template v-slot:[`item._actions`]="{ item }">
        <VBtn icon="mdi-delete" variant="text" @click="deleteMember(item.user._id)" />
      </template>
    </VDataTableServer>
  </VCard>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import AoiGravatar from '@/components/aoi/AoiGravatar.vue'
import CapabilityChips from '@/components/utils/CapabilityChips.vue'
import UserIdInput from '@/components/utils/UserIdInput.vue'
import { orgBits } from '@/utils/capability'
import { http } from '@/utils/http'
import { withTitle } from '@/utils/title'

const props = defineProps<{
  orgId: string
  groupId: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('term.members')))

const headers = [
  { title: t('term.profile'), key: 'profile', align: 'start', sortable: false },
  { title: t('term.id'), key: '_id' },
  { title: t('term.capabilities'), key: '_cap' },
  { title: t('term.actions'), key: '_actions' }
] as const

const groups = useAsyncState(
  async (page = 1, itemsPerPage = 15) => {
    const resp = await http.get(`group/${props.groupId}/member`, {
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
  await http.delete(`group/${props.groupId}/member/${userId}`)
  groups.execute()
}

const newMember = ref('')
async function addMember() {
  await http.post(`group/${props.groupId}/member`, {
    json: {
      userId: newMember.value
    }
  })
  groups.execute()
  newMember.value = ''
}
</script>
