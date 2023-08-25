<template>
  <VCard variant="flat" :title="t('term.settings')">
    <AsyncState :state="settings" v-slot="{ value }">
      <VCardSubtitle>{{ t('oss-settings') }}</VCardSubtitle>
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
        <VAlert v-else type="warning" :text="t('warn-oss-disabled')" variant="outlined">
          <div class="d-flex pt-4">
            <VBtn
              :text="t('enable-oss')"
              dark
              @click="value.oss = { bucket: 'aoi', accessKey: '', secretKey: '' }"
            />
          </div>
        </VAlert>
      </VCardText>
      <VCardActions>
        <VBtn color="primary" @click="save">{{ t('action.save') }}</VBtn>
        <VBtn color="error" @click="settings.execute()">{{ t('action.reset') }}</VBtn>
      </VCardActions>
    </AsyncState>
  </VCard>
</template>

<script setup lang="ts">
import { http } from '@/utils/http'
import type { IOrgSettings } from '@/types'
import { useAsyncState } from '@vueuse/core'
import AsyncState from '@/components/utils/AsyncState.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
<i18n>
en:
  oss-settings: OSS Settings
  warn-oss-disabled: OSS is disabled
  enable-oss: Enable OSS
zh-Hans:
  oss-settings: OSS 设置
  warn-oss-disabled: OSS 未启用
  enable-oss: 启用 OSS
</i18n>
