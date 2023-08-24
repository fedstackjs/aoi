<template>
  <VContainer>
    <VRow>
      <VCol>
        <AsyncState :state="group">
          <template v-slot="{ value }">
            <VCard>
              <VCardTitle>
                {{ value.profile.name }}
              </VCardTitle>
              <VTabs color="primary">
                <VTab value="profile" :to="rel('')" exact>
                  <VIcon start> mdi-account-box </VIcon>
                  {{ t('term.profile') }}
                </VTab>
                <VTab value="members" :to="rel('member')" exact>
                  <VIcon start> mdi-account </VIcon>
                  {{ t('term.members') }}
                </VTab>
                <VTab value="settings" :to="rel('settings')">
                  <VIcon start> mdi-cog </VIcon>
                  {{ t('term.settings') }}
                </VTab>
              </VTabs>
              <VDivider />
              <RouterView :group="value" @updated="group.execute()" />
            </VCard>
          </template>
        </AsyncState>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import AsyncState from '@/components/utils/AsyncState.vue'
import { http } from '@/utils/http'
import { withTitle } from '@/utils/title'
import { useAsyncState } from '@vueuse/core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IGroupDTO } from '@/components/group/types'

const props = defineProps<{
  orgId: string
  groupId: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.groups')))

const group = useAsyncState(async () => {
  const resp = await http.get(`group/${props.groupId}`)
  const data = await resp.json<IGroupDTO>()
  if (data.orgId !== props.orgId) throw new Error('Invalid group')
  return data
}, null as never)

const rel = (to: string) => `/org/${props.orgId}/group/${props.groupId}/${to}`
</script>
