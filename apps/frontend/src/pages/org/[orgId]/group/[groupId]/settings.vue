<template>
  <VCardSubtitle>{{ t('term.profile') }}</VCardSubtitle>
  <VCardText>
    <VTextField v-model="profile.name" :label="t('term.name')" />
    <VTextField v-model="profile.email" :label="t('term.email')" type="email" />
  </VCardText>
  <VCardActions>
    <VBtn color="primary" @click="save">{{ t('action.save') }}</VBtn>
    <VBtn color="error" @click="reset">{{ t('action.reset') }}</VBtn>
  </VCardActions>
  <VDivider />
  <VCardSubtitle>{{ t('term.danger-zone') }}</VCardSubtitle>
  <VCardActions>
    <VBtn color="error" @click="deleteGroup">{{ t('delete-group') }}</VBtn>
  </VCardActions>
</template>

<script setup lang="ts">
import type { IGroupDTO } from '@/components/group/types'
import { http } from '@/utils/http'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  orgId: string
  groupId: string
  group: IGroupDTO
}>()

const emits = defineEmits<{
  (ev: 'updated'): void
}>()

const router = useRouter()

const profile = reactive({
  name: '',
  email: ''
})

function reset() {
  profile.name = props.group.profile.name
  profile.email = props.group.profile.email
}

reset()

async function save() {
  await http.patch(`group/${props.groupId}/profile`, {
    json: profile
  })
  emits('updated')
}

async function deleteGroup() {
  await http.delete(`group/${props.groupId}`)
  router.replace(`/org/${props.orgId}`)
}
</script>
<i18n>
en:
  delete-group: Delete Group
zhHans:
  delete-group: 删除组织
</i18n>
