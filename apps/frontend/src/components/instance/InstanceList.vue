<template>
  <VToolbar>
    <VToolbarTitle>{{ t('tabs.instances') }}</VToolbarTitle>
    <VSpacer />
    <VBtn
      v-if="canCreateInstance"
      @click="createInstanceTask.execute()"
      :loading="createInstanceTask.isLoading.value"
      color="primary"
    >
      {{ t('action.create') }}
    </VBtn>
    <InstanceFilter
      :mode="mode"
      :org-id="orgId"
      :self-only="selfOnly"
      v-model:user-id="filter.userId.value"
      v-model:contest-id="filter.contestId.value"
      v-model:problem-id="filter.problemId.value"
      v-model:state="filter.state.value"
    />
    <template v-if="!selfOnly">
      <VBtn :text="t('common.all')" @click="filter.userId.value = ''" :active="isAll" />
      <VBtn :text="t('common.self')" @click="filter.userId.value = app.userId" :active="isSelf" />
    </template>
  </VToolbar>
  <VDataTableServer
    :headers="headers"
    :items-length="instances.state.value.total"
    :items="items"
    :items-per-page-options="[15, 30, 50, 100]"
    :loading="instances.isLoading.value"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    item-value="_id"
    @update:options="handleOptionsUpdate"
    show-expand
  >
    <template v-slot:[`item.state`]="{ item }">
      <InstanceStateChip :state="item.state" @click.right="filter.state.value = '' + item.state" />
    </template>
    <template v-slot:[`item.userId`]="{ item }">
      <PrincipalProfile :principal-id="item.userId" />
    </template>
    <template v-slot:[`item.problemTitle`]="{ item }">
      <RouterLink :to="item.problemUrl" style="color: primary">
        {{ item.problemTitle }}
      </RouterLink>
    </template>
    <template v-slot:[`item.contestTitle`]="{ item }">
      <component :is="item.contestUrl ? RouterLink : 'span'" :to="item.contestUrl">
        {{ item.contestTitle }}
      </component>
    </template>
    <!-- <template v-slot:[`item.slotNo`]="{ item }">
      <span>{{ item.slotNo }}</span>
    </template> -->
    <template v-slot:[`item.createdAt`]="{ item }">
      <code>{{ item.createdAtStr }}</code>
    </template>
    <template v-slot:expanded-row="{ columns, item }">
      <tr>
        <td :colspan="columns.length" class="py-2">
          <VCard>
            <VCardText v-if="item.message">
              <MarkdownRenderer :md="item.message" />
            </VCardText>
            <VAlert v-else type="info" text="Instance is waiting to be provisioned." />
          </VCard>
        </td>
      </tr>
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import MarkdownRenderer from '../utils/MarkdownRenderer.vue'
import PrincipalProfile from '../utils/PrincipalProfile.vue'

import InstanceFilter from './InstanceFilter.vue'
import { useInstanceList } from './InstanceList'
import InstanceStateChip from './InstanceStateChip.vue'

import { useAppState } from '@/stores/app'

const { t } = useI18n()
const app = useAppState()

const props = defineProps<{
  orgId: string
  problemId?: string
  contestId?: string
  selfOnly?: boolean
}>()

const {
  mode,
  filter,
  headers,
  page,
  itemsPerPage,
  instances,
  items,
  isSelf,
  isAll,
  canCreateInstance,
  createInstanceTask
} = useInstanceList(props)

interface TableOptions {
  page: number
  itemsPerPage: number
}

const handleOptionsUpdate = ({ page, itemsPerPage }: TableOptions) => {
  instances.execute(0, page, itemsPerPage)
}
</script>
