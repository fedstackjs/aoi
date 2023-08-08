<template>
  <VContainer>
    <VRow>
      <VSpacer />
      <VPagination v-model="nowIndex" :length="totalPages" :total-visible="10" />
      <VSpacer />
    </VRow>
    <VRow>
      <VCol>
        <VCard>
          <!-- problem list -->
          <VTable v-if="probList.state.value">
            <thead>
              <tr>
                <th class="text-left"><span class="text-bold">#</span></th>
                <th class="text-left">{{ t('prob-slug') }}</th>
                <th class="text-left">{{ t('prob-title') }}</th>
                <th class="text-left">{{ t('prob-tags') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prob in probList.state.value.items" :key="prob._id">
                <td>{{ prob._id }}</td>
                <td>{{ prob.slug }}</td>
                <td>
                  <a
                    class="text-blue text-decoration-none"
                    :href="`/org/${appState.orgId}/problem/${prob._id}`"
                    :target="'_blank'"
                  >
                    {{ prob.title }}
                  </a>
                </td>
                <td>
                  <VChip v-for="tag in prob.tags" :key="tag" class="mx-1">
                    {{ tag }}
                  </VChip>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCard>
      </VCol>
    </VRow>
    <VRow>
      <VSpacer />
      <VPagination v-model="nowIndex" :length="totalPages" :total-visible="10" />
      <VSpacer />
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { http } from '@/utils/http'
import { useAppState } from '@/stores/app'
import { useRoute, useRouter } from 'vue-router'
import { useAsyncState } from '@vueuse/core'

const { t } = useI18n()
const appState = useAppState()
const route = useRoute()
const router = useRouter()

withTitle(computed(() => t('problems')))

const nowIndex = ref(parseInt((route.query.page as string) || '1'))
const itemsPerPage = ref(15)
const totalPages = computed(() =>
  Math.ceil((probList.state.value?.total ?? 0) / itemsPerPage.value)
)

const probList = useAsyncState(async () => {
  const resp = await http.get(`problem`, {
    searchParams: {
      orgId: appState.orgId,
      page: nowIndex.value,
      perPage: itemsPerPage.value,
      count: true
    }
  })

  return resp.json<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any[]
    total: number
  }>()
}, null as never)

watch(nowIndex, () => {
  router.push(`/org/${appState.orgId}/problem?page=${nowIndex.value}`)
  console.log('now index = ', nowIndex.value)
  probList.execute()
})
</script>

<i18n>
en:
  prob-slug: Slug
  prob-title: Title
  prob-tags: Tags
zhHans:
  prob-slug: 编号
  prob-title: 标题
  prob-tags: 标签
</i18n>
