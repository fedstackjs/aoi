<template>
  <VCardSubtitle>Profile</VCardSubtitle>
  <VCardText>
    <VTextField v-model="profile.name" label="Name" />
    <VTextField v-model="profile.email" label="Email" type="email" />
  </VCardText>
  <VCardActions>
    <VBtn color="primary" @click="save">Save</VBtn>
    <VBtn color="error" @click="reset">Reset</VBtn>
  </VCardActions>
  <VDivider />
  <VCardSubtitle>Danger Zone</VCardSubtitle>
  <VCardActions>
    <VBtn color="error" @click="deleteGroup">Delete Group</VBtn>
  </VCardActions>
</template>

<script setup lang="ts">
import type { IGroupDTO } from '@/components/group/types'
import { http } from '@/utils/http'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

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
