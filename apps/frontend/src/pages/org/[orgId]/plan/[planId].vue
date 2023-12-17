<template>
  <VContainer>
    <VRow>
      <VCol>
        <AsyncState :state="plan" hide-when-loading>
          <template v-slot="{ value }">
            <VCard>
              <VCardTitle class="d-flex justify-space-between">
                <div>
                  <p class="text-h4">{{ value.title }}</p>
                  <p class="text-h6 ml-2">{{ value.slug }}</p>
                </div>
                <div>
                  <VChipGroup class="justify-end">
                    <VChip v-for="tag in value.tags" class="mx-2" :key="tag">
                      {{ tag }}
                    </VChip>
                    <AccessLevelChip :accessLevel="value.accessLevel" />
                  </VChipGroup>
                  <RegisterBtn :endpoint="`plan/${planId}/register`" :participant="participant" />
                </div>
              </VCardTitle>
              <VDivider />

              <VTabs>
                <VTab prepend-icon="mdi-book-outline" :to="rel('')">
                  {{ t('tabs.description') }}
                </VTab>
                <VTab prepend-icon="mdi-attachment" :to="rel('contest')">
                  {{ t('tabs.contests') }}
                </VTab>
                <VTab prepend-icon="mdi-cog-outline" :to="rel('admin')" v-if="showAdminTab">
                  {{ t('tabs.management') }}
                </VTab>
              </VTabs>
              <RouterView :plan="value" @updated="plan.execute()" />
            </VCard>
          </template>
        </AsyncState>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAsyncState } from '@vueuse/core'
import { http } from '@/utils/http'
import AsyncState from '@/components/utils/AsyncState.vue'
import AccessLevelChip from '@/components/utils/AccessLevelChip.vue'
import RegisterBtn from '@/components/utils/RegisterBtn.vue'
import { usePlan } from '@/utils/plan/inject'
import { toRef } from 'vue'

const { t } = useI18n()
const props = defineProps<{
  orgId: string
  planId: string
}>()

withTitle(computed(() => t('pages.plans')))

const { plan, showAdminTab } = usePlan(toRef(props, 'orgId'), toRef(props, 'planId'))

const participant = useAsyncState(async () => {
  const resp = await http.get(`plan/${props.planId}/self`).json<unknown>()
  return resp
}, null)

const rel = (to: string) => `/org/${props.orgId}/plan/${props.planId}/${to}`
</script>
