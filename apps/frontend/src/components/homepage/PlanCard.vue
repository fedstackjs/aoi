<template>
  <VCard color="grey-lighten-4">
    <VToolbar dark color="grey-lighten-2">
      <VBtn icon="mdi-clipboard-text-outline" variant="plain" />
      <VToolbarTitle>
        <a :href="`/org/${props.orgId}/plan/${props.planId}`">
          {{ title }}
        </a>
      </VToolbarTitle>
    </VToolbar>
    <VCardText>
      <VTable class="bg-grey-lighten-4">
        <thead>
          <tr>
            <th class="text-subtitle-1">{{ t('plan.stage') }}</th>
          </tr>
        </thead>
        <tbody>
          <AsyncState :state="curPlan" hide-when-loading>
            <template v-slot="{ value }">
              <tr v-for="(item, i) in value.contests" :key="i">
                <td class="text-body-1">
                  <a :href="`/org/${props.orgId}/plan/${props.planId}/contest/${item._id}`">
                    {{ item.title }}
                  </a>
                </td>
              </tr>
            </template>
          </AsyncState>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import AsyncState from '@/components/utils/AsyncState.vue'
import { http } from '@/utils/http'
import { computed } from 'vue'

const props = defineProps<{
  title?: string
  planId: string
  orgId: string
}>()

const { t } = useI18n()
const title = computed(() => props.title || (curPlan.state.value?.title ?? t('pages.plans')))

const curPlan = useAsyncState(async () => {
  const respPlan = await http.get(`plan/${props.planId}`)
  const { title } = await respPlan.json<{ title: string }>()
  const respContest = await http.get(`plan/${props.planId}/contest`)
  const planContests = await respContest.json<Array<{ _id: string; title: string }>>()
  return {
    title: title,
    contests: planContests
  }
}, null as never)
</script>
<i18n>
en:
  plan:
    stage: Stage
zh-Hans:
  plan:
    stage: 阶段
</i18n>
