<template>
  <VCard flat :title="t('term.contest-stage')">
    <AsyncState :state="stages">
      <template v-slot="{ value }">
        <VExpansionPanels>
          <VExpansionPanel v-for="(item, i) of value" :key="i" :elevation="0">
            <VExpansionPanelTitle>
              <div class="d-flex justify-space-between flex-grow-1 align-center">
                <div>
                  {{ item.name }}
                </div>
                <div>
                  <template v-if="item.start">
                    {{ t('common.from') }}
                    <VChip color="blue" :text="new Date(item.start).toLocaleString()" />
                  </template>
                  <template v-if="value[i + 1]">
                    {{ t('common.to') }}
                    <VChip color="red" :text="new Date(value[i + 1].start).toLocaleString()" />
                  </template>
                  <template v-if="item.start && value[i + 1]">
                    {{ t('common.lasts') }}
                    <VChip color="green" :text="ms(value[i + 1].start - item.start)" />
                  </template>
                </div>
              </div>
            </VExpansionPanelTitle>
            <VExpansionPanelText>
              <VTextField :label="t('term.name')" v-model="item.name" />
              <DateTimeInput :label="t('term.start-time')" v-model="item.start" :disabled="!i" />
              <ContestStageSettings v-model="item.settings" />
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </template>
    </AsyncState>
    <VCardActions>
      <VBtn color="error" @click="stages.execute()">
        {{ t('action.reload') }}
      </VBtn>
      <VBtn @click="create">{{ t('action.new') }}</VBtn>
      <VBtn color="primary" @click="save">{{ t('action.save') }}</VBtn>
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
import ms from 'ms'

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
