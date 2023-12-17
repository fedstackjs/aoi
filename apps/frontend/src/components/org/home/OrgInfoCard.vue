<template>
  <VCard color="grey-lighten-4">
    <AsyncState :state="profile" hide-when-loading>
      <template v-slot="{ value }">
        <VListItem class="ma-4">
          <template v-slot:prepend>
            <VAvatar size="96">
              <AppGravatar :email="value.profile.email" />
            </VAvatar>
          </template>
          <VListItemTitle class="text-h5 pa-2">
            {{ value.profile.name }}
          </VListItemTitle>
          <VListItemSubtitle class="pa-2">
            {{ value.profile.email }}
          </VListItemSubtitle>
        </VListItem>
      </template>
    </AsyncState>
  </VCard>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import AppGravatar from '@/components/app/AppGravatar.vue'
import AsyncState from '@/components/utils/AsyncState.vue'
import { http } from '@/utils/http'

const props = defineProps<{ orgId: string }>()

const profile = useAsyncState(async () => {
  const resp = await http.get(`org/${props.orgId}`)
  return resp.json<{ profile: { name: string; email: string } }>()
}, null as never)
</script>
