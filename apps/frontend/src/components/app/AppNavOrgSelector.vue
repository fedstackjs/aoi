<template>
  <VListItem v-if="appState.orgId" :to="'/org/' + appState.orgId" exact>
    <template #prepend>
      <VAvatar rounded="lg">
        <AppGravatar :email="appState.orgProfile.state.value?.profile.email ?? ''" />
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
    </VCard>
  </VMenu>
</template>

<script setup lang="ts">
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import AppGravatar from '../app/AppGravatar.vue'
import { useAppState } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'
import { useRouter } from 'vue-router'

const appState = useAppState()
const { t } = useI18n()
const router = useRouter()

const joinedOrgs = useAsyncState(async () => {
  const orgs = await http.get('org')
  const orgArr = await orgs.json<
    Array<{
      _id: string
      profile: {
        name: string
        email: string
      }
    }>
  >()
  if (orgArr.length > 0 && router.currentRoute.value.path === '/') {
    router.replace(`/org/${orgArr[0]._id}`)
  }
  return orgArr
}, [])

watch(
  () => appState.userId,
  () => joinedOrgs.execute()
)
</script>

<i18n global>
en:
  select-organization: Select organization
zh-Hans:
  select-organization: 选择组织
</i18n>
