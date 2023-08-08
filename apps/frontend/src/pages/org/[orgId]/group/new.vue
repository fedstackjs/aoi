<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('new-group')">
          <VCardText>
            <VTextField v-model="profile.name" label="Name" />
            <VTextField v-model="profile.email" label="Email" type="email" />
          </VCardText>
          <VCardActions>
            <VBtn color="primary" variant="elevated" @click="create">{{ t('create') }}</VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { http } from '@/utils/http'
import { withTitle } from '@/utils/title'
import { reactive } from 'vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const props = defineProps<{
  orgId: string
}>()

const { t } = useI18n()
const router = useRouter()

withTitle(computed(() => t('new-group')))

const profile = reactive({
  name: '',
  email: ''
})

async function create() {
  const resp = await http.post(`group`, {
    json: {
      orgId: props.orgId,
      profile
    }
  })
  const { groupId } = await resp.json<{ groupId: string }>()
  router.push(`/org/${props.orgId}/group/${groupId}`)
}
</script>

<i18n global>
en:
  new-group: New group
zhHans:
  new-group: 新建小组
</i18n>
