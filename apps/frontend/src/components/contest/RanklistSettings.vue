<template>
  <VCard flat>
    <VCardSubtitle>
      {{ t('term.schedule') }}
    </VCardSubtitle>
    <SettingsEditor :endpoint="`contest/${contestId}/ranklist/${props.ranklistKey}/settings`">
      <template v-slot="scoped">
        <RanklistSettingsInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
    <VCardSubtitle>
      {{ t('term.is-public') }}
    </VCardSubtitle>
    <RanklistPublicSettings
      :contestId="contestId"
      :orgId="orgId"
      :ranklistKey="props.ranklistKey"
    />
    <VCardSubtitle>
      {{ t('term.danger-zone') }}
    </VCardSubtitle>
    <VCardActions>
      <VBtn color="error" variant="elevated" @click="deleteRanklist()">
        {{ t('action.delete') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { http } from '@/utils/http'
import SettingsEditor from '@/components/utils/SettingsEditor.vue'
import RanklistSettingsInput from './RanklistSettingsInput.vue'
import { useRouter } from 'vue-router'
import RanklistPublicSettings from './RanklistPublicSettings.vue'

const router = useRouter()

const props = defineProps<{
  contestId: string
  orgId: string
  ranklistKey: string
}>()

const { t } = useI18n()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

async function deleteRanklist() {
  await http.delete(`contest/${props.contestId}/ranklist/${props.ranklistKey}`)
  router.push(`/org/${props.orgId}/contest/${props.contestId}/ranklist`)
  emit('updated')
}
</script>
<i18n>
en:
  is-public: Is Public
zh-Hans:
  is-public: 是否公开
</i18n>
