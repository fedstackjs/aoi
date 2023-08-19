<template>
  <VContainer>
    <VRow>
      <VCol>
        <AsyncState :state="plan">
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
                </div>
              </VCardTitle>
              <VDivider />

              <VTabs>
                <VTab prepend-icon="mdi-book-outline" :to="rel('')">
                  {{ t('description') }}
                </VTab>
                <VTab prepend-icon="mdi-attachment" :to="rel('contest')">
                  {{ t('contests') }}
                </VTab>
                <VTab prepend-icon="mdi-cog-outline" :to="rel('admin')">
                  {{ t('management') }}
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
import type { IPlanDTO } from '@/components/plan/types'
import AccessLevelChip from '@/components/utils/AccessLevelChip.vue'

const { t } = useI18n()
const props = defineProps<{
  orgId: string
  planId: string
}>()

withTitle(computed(() => t('plans')))

const plan = useAsyncState(async () => {
  const planId = props.planId
  const resp = await http.get(`plan/${planId}`)
  const data = await resp.json<IPlanDTO>()
  if (data.orgId !== props.orgId) throw new Error('orgId not match')
  return data
}, null as never)

const rel = (to: string) => `/org/${props.orgId}/plan/${props.planId}/${to}`
</script>
