<template>
  <VCard flat :title="t('problem-settings')">
    <VDivider />
    <AsyncState :state="settings">
      <template v-slot="scoped">
        <VCardText>
          <ProblemSettingsInput v-model="scoped.value" />
        </VCardText>
        <VCardActions>
          <VBtn color="error" variant="elevated" @click="settings.execute()">
            {{ t('action.reset') }}
          </VBtn>
          <VBtn color="primary" variant="elevated" @click="patchSettings.execute()">
            {{ t('action.save') }}
          </VBtn>
        </VCardActions>
      </template>
    </AsyncState>
    <VDivider />
    <AccessLevelEditor
      :access-level="problem.accessLevel"
      :prefix="`problem/${problemId}/admin/accessLevel`"
      @updated="emit('updated')"
    />
    <VDivider />
    <VCardSubtitle>
      {{ t('danger-zone') }}
    </VCardSubtitle>
    <VCardText>
      <VBtn color="red" variant="elevated">
        {{ t('delete') }}
      </VBtn>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import AccessLevelEditor from '@/components/utils/AccessLevelEditor.vue'
import { http } from '@/utils/http'
import { useI18n } from 'vue-i18n'
import type { IProblemDTO } from '@/components/problem/types'
import type { IProblemSettings } from '@/types'
import { useAsyncState } from '@vueuse/core'
import { useAsyncTask } from '@/utils/async'
import AsyncState from '@/components/utils/AsyncState.vue'
import ProblemSettingsInput from '@/components/problem/ProblemSettingsInput.vue'

const props = defineProps<{
  orgId: string
  problemId: string
  problem: IProblemDTO
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()

const settings = useAsyncState(
  async () => {
    return http.get(`problem/${props.problemId}/admin/settings`).json<IProblemSettings>()
  },
  null,
  { shallow: false }
)
const patchSettings = useAsyncTask(async () => {
  await http.patch(`problem/${props.problemId}/admin/settings`, {
    json: settings.state.value
  })
  settings.execute()
})
</script>

<i18n>
zhHans:
  problem-settings: 设置
en:
  problem-settings: Settings
</i18n>
