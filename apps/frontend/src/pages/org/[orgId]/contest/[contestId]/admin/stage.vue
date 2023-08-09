<template>
  <VCard flat :title="t('contest-stages')">
    <AsyncState :state="stages">
      <template v-slot="{ value }">
        <VExpansionPanels>
          <VExpansionPanel v-for="(item, i) of value" :key="i" :title="item.name" :elevation="0">
            <VExpansionPanelText>
              <VTextField v-model="item.name" />
              <DateTimeInput v-model="item.start" />
              <ContestStageSettings v-model="item.settings" />
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </template>
    </AsyncState>
    <VCardActions>
      <VBtn color="error" @click="stages.execute()">
        {{ t('reload') }}
      </VBtn>
      <VBtn @click="create">{{ t('new') }}</VBtn>
      <VBtn color="primary" @click="save">{{ t('save') }}</VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import type { IContestDTO } from '@/components/contest/types'
import type { IContestStage } from '@/types'
import AsyncState from '@/components/utils/AsyncState.vue'
import DateTimeInput from '@/components/utils/DateTimeInput.vue'
import ContestStageSettings from '@/components/contest/ContestStageSettings.vue'
import { useToast } from 'vue-toastification'

const props = defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()
const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
const toast = useToast()

const stages = useAsyncState(
  async () => {
    const resp = await http.get(`contest/${props.contestId}/admin/stages`)
    return resp.json<IContestStage[]>()
  },
  [],
  { shallow: false }
)

function create() {
  stages.state.value.push({
    name: 'unnamed stage',
    start: +new Date(),
    settings: {}
  } satisfies IContestStage)
}

async function save() {
  try {
    await http.patch(`contest/${props.contestId}/admin/stages`, {
      json: stages.state.value
    })
    emit('updated')
  } catch (err) {
    toast.error(`Error: ${err}`)
  }
}
</script>
