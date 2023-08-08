<template>
  <VCard variant="flat" title="Settings">
    <AsyncState :state="settings" v-slot="{ value }">
      <VCardSubtitle>OSS Settings</VCardSubtitle>
      <VCardText>
        <template v-if="value.oss">
          <VTextField label="Endpoint" v-model="value.oss.endpoint" />
          <div class="u-grid u-grid-cols-2 u-gap-2">
            <VTextField label="Bucket" v-model="value.oss.bucket" />
            <VTextField label="Region" v-model="value.oss.region" />
            <VTextField label="AccessKey" v-model="value.oss.accessKey" />
            <VTextField label="SecretKey" v-model="value.oss.secretKey" placeholder="Unchanged" />
          </div>
          <VCheckbox label="PathStyle" v-model="value.oss.pathStyle" />
        </template>
        <VAlert v-else type="warning" text="OSS is disabled" variant="outlined">
          <div class="d-flex pt-4">
            <VBtn
              text="enable oss"
              dark
              @click="value.oss = { bucket: 'aoi', accessKey: '', secretKey: '' }"
            />
          </div>
        </VAlert>
      </VCardText>
      <VCardActions>
        <VBtn color="primary" @click="save">Save</VBtn>
        <VBtn color="error" @click="settings.execute()">Reset</VBtn>
      </VCardActions>
    </AsyncState>
  </VCard>
</template>

<script setup lang="ts">
import { http } from '@/utils/http'
import type { IOrgSettings } from '@/types'
import { useAsyncState } from '@vueuse/core'
import AsyncState from '@/components/utils/AsyncState.vue'

const props = defineProps<{
  orgId: string
}>()

const settings = useAsyncState(
  async () => {
    const resp = await http.get(`org/${props.orgId}/admin/settings`)
    return resp.json<IOrgSettings>()
  },
  null as never,
  { shallow: false }
)

async function save() {
  await http.patch(`org/${props.orgId}/admin/settings`, {
    json: settings.state.value
  })
  settings.execute()
}
</script>
