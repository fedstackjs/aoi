<template>
  <VContainer>
    <VRow>
      <VCol>
        <AsyncState :state="app" hide-when-loading>
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
                  {{ t('tabs.description') }}
                </VTab>
                <VTab prepend-icon="mdi-cog-outline" :to="rel('admin')" v-if="showAdminTab">
                  {{ t('tabs.management') }}
                </VTab>
              </VTabs>
              <RouterView @updated="app.execute()" />
            </VCard>
          </template>
        </AsyncState>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import AccessLevelChip from '@/components/utils/AccessLevelChip.vue'
import AsyncState from '@/components/utils/AsyncState.vue'
import { useApp } from '@/utils/app/inject'
import { withI18nTitle } from '@/utils/title'

const { t } = useI18n()
const props = defineProps<{
  orgId: string
  appId: string
}>()

withI18nTitle('pages.apps')

const { app, showAdminTab } = useApp(toRef(props, 'orgId'), toRef(props, 'appId'))

const rel = (to: string) => `/org/${props.orgId}/app/${props.appId}/${to}`
</script>
