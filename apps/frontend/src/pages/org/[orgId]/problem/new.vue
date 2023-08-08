<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('new-problem')">
          <VCardText>
            <VRadioGroup inline v-model="probAccessLevel" :label="t('access-level')">
              <VRadio :value="0" label="PUBLIC"></VRadio>
              <VRadio :value="1" label="RESTRICTED"></VRadio>
              <VRadio :value="2" label="PRIVATE"></VRadio>
            </VRadioGroup>
            <VTextField v-model="probTitle" :label="t('prob-title')" :rules="probTitleRules" />
            <VTextField v-model="probSlug" :label="t('prob-slug')" :rules="probSlugRules" />
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
import { withTitle } from '@/utils/title'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { http } from '@/utils/http'
import { useRouter } from 'vue-router'
import { useAppState } from '@/stores/app'

const { t } = useI18n()
const router = useRouter()
const appState = useAppState()

withTitle(computed(() => t('new-problem')))

const probAccessLevel = ref(0)
const probTitle = ref<string>('')
const probSlug = ref<string>('')

const probTitleRules = [
  (value: string) => {
    if (value.length >= 1) return true
    return 'Title must not be empty.'
  }
]

const probSlugRules = [
  (value: string) => {
    if (value.length >= 1) return true
    return 'Slug must not be empty.'
  }
]

async function create() {
  if (!appState.orgId) return
  if (!probTitleRules.every((rule) => rule(probTitle.value) === true)) return
  if (!probSlugRules.every((rule) => rule(probSlug.value) === true)) return

  const resp = await http.post(`problem`, {
    json: {
      accessLevel: probAccessLevel.value,
      slug: probSlug.value,
      title: probTitle.value,
      orgId: appState.orgId
    }
  })
  const { problemId } = await resp.json<{ problemId: string }>()
  router.replace(`/org/${appState.orgId}/problem/${problemId}`)
}
</script>

<i18n>
en:
  access-level: Access Level
  prob-title: Problem Title
  prob-slug: Problem Slug
zhHans:
  access-level: 权限等级
  prob-title: 题目标题
  prob-slug: 题目编号
</i18n>
