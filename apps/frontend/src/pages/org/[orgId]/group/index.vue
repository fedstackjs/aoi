<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('pages.groups')">
          <VDataTableServer
            :headers="headers"
            :items-length="groups.state.value.total"
            :items="groups.state.value.items"
            :items-per-page="15"
            :items-per-page-options="[{ title: '15', value: 15 }]"
            :loading="groups.isLoading.value"
            item-value="name"
            @update:options="({ page, itemsPerPage }) => groups.execute(0, page, itemsPerPage)"
          >
            <template v-slot:[`item._id`]="{ item }">
              <code>{{ item._id }}</code>
            </template>
            <template v-slot:[`item.name`]="{ item }">
              <RouterLink :to="`/org/${orgId}/group/${item._id}`">
                <VAvatar>
                  <AppGravatar :email="item.profile.email" />
                </VAvatar>
                <code class="u-pl-2">{{ item.profile.name }}</code>
              </RouterLink>
            </template>
          </VDataTableServer>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { http } from '@/utils/http'
import { withTitle } from '@/utils/title'
import { useAsyncState } from '@vueuse/core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppGravatar from '@/components/app/AppGravatar.vue'

const props = defineProps<{
  orgId: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.groups')))

const headers = [
  { title: t('term.name'), key: 'name', align: 'start', sortable: false },
  { title: 'ID', key: '_id' }
] as const

const groups = useAsyncState(
  async (page = 1, itemsPerPage = 15) => {
    const resp = await http.get(`group`, {
      searchParams: {
        orgId: props.orgId,
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
</script>
