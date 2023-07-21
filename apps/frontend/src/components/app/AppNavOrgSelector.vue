<template>
  <VMenu location="end" min-width="160">
    <template v-slot:activator="{ props }">
      <VListItem v-bind="props">
        <template #prepend>
          <VAvatar v-if="appState.orgId" rounded="lg">
            <AppGravatar :email="appState.orgProfile.state?.email ?? ''" />
          </VAvatar>
          <VIcon v-else>mdi-account-group</VIcon>
        </template>
        <template v-if="appState.orgId">
          <VListItemTitle>{{ appState.orgProfile.state?.name }}</VListItemTitle>
          <VOverlay
            :model-value="appState.orgProfile.isLoading"
            contained
            class="align-center justify-center"
          >
            <VProgressCircular color="primary" indeterminate />
          </VOverlay>
        </template>
        <template v-else>
          <VListItemTitle>
            {{ t('select-organization') }}
          </VListItemTitle>
        </template>
        <template #append>
          <VIcon v-if="!appState.orgId">mdi-chevron-right</VIcon>
        </template>
      </VListItem>
    </template>
    <VList>
      <VListItem v-for="org in joinedOrgs.state.value" :key="org._id" :to="'/org/' + org._id">
        <template #prepend>
          <VAvatar rounded="lg">
            <AppGravatar :email="org.profile.email" />
          </VAvatar>
        </template>
        <VListItemTitle>{{ org.profile.name }}</VListItemTitle>
      </VListItem>
    </VList>
  </VMenu>
</template>

<script setup lang="ts">
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import AppGravatar from '../app/AppGravatar.vue'
import { useAppState } from '@/stores/app'
import { useI18n } from 'vue-i18n'

const appState = useAppState()
const { t } = useI18n()

const joinedOrgs = useAsyncState(async () => {
  const orgs = await http.get('org')
  return orgs.json<
    Array<{
      _id: string
      profile: {
        name: string
        email: string
      }
    }>
  >()
}, [])
</script>

<i18n global>
en:
  select-organization: Select organization
zhHans:
  select-organization: 选择组织
</i18n>
