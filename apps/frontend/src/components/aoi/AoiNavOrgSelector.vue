<template>
  <VListItem v-if="appState.orgId" :to="'/org/' + appState.orgId" exact>
    <template #prepend>
      <VAvatar rounded="lg">
        <AoiGravatar :email="appState.orgProfile.state.value?.profile.email ?? ''" />
      </VAvatar>
    </template>
    <VListItemTitle>{{ appState.orgProfile.state.value?.profile.name }}</VListItemTitle>
    <VOverlay
      :model-value="appState.orgProfile.isLoading.value"
      contained
      class="align-center justify-center"
    >
      <VProgressCircular color="primary" indeterminate />
    </VOverlay>
  </VListItem>
  <VMenu location="end" min-width="160">
    <template v-slot:activator="{ props }">
      <VListItem v-bind="props">
        <template #prepend>
          <VIcon>mdi-account-group</VIcon>
        </template>
        <VListItemTitle>
          {{ t('select-organization') }}
        </VListItemTitle>
        <template #append>
          <VIcon>mdi-chevron-right</VIcon>
        </template>
      </VListItem>
    </template>
    <VCard class="u-min-w-64" :title="t('select-organization')">
      <VDivider />
      <VList v-if="appState.joinedOrgs.state.value.length">
        <VListItem
          v-for="org in appState.joinedOrgs.state.value"
          :key="org._id"
          :to="'/org/' + org._id"
        >
          <template #prepend>
            <VAvatar rounded="lg">
              <AoiGravatar :email="org.profile.email" />
            </VAvatar>
          </template>
          <VListItemTitle>{{ org.profile.name }}</VListItemTitle>
        </VListItem>
      </VList>
      <VCardText v-else>
        <VAlert type="info">
          {{ t('msg.no-joined-organization') }}
        </VAlert>
      </VCardText>
    </VCard>
  </VMenu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import AoiGravatar from '../aoi/AoiGravatar.vue'

import { useAppState } from '@/stores/app'

const appState = useAppState()
const { t } = useI18n()
</script>

<i18n global>
en:
  select-organization: Select organization
zh-Hans:
  select-organization: 选择组织
</i18n>
