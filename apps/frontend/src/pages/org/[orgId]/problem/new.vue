<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('new-problem')">
          <VCardText>
            <VRadioGroup inline v-model="probAccessLevel" :label="t('auth.access-level')">
              <VRadio :value="0" :label="t('auth.public')"></VRadio>
              <VRadio :value="1" :label="t('auth.restricted')"></VRadio>
              <VRadio :value="2" :label="t('auth.private')"></VRadio>
            </VRadioGroup>
            <VTextField v-model="probTitle" :label="t('prob-title')" :rules="probTitleRules" />
            <VTextField v-model="probSlug" :label="t('prob-slug')" :rules="probSlugRules" />
          </VCardText>
          <VCardActions>
            <VBtn
              v-if="enableSlugFinder"
              color="info"
              variant="elevated"
              :loading="findSlug.isLoading.value"
              @click="findSlug.execute()"
            >
              {{ t('action.generate-slug') }}
            </VBtn>
            <VBtn color="primary" variant="elevated" @click="create">{{ t('action.create') }}</VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useAppState } from '@/stores/app'
import { noMessage, useAsyncTask } from '@/utils/async'
import { enableSlugFinder } from '@/utils/flags'
import { http } from '@/utils/http'
import { findNextSlug } from '@/utils/slug'
import { withTitle } from '@/utils/title'

const props = defineProps<{
  orgId: string
}>()

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
    return t('hint.violate-title-rule')
  }
]

const probSlugRules = [
  (value: string) => {
    if (value.length >= 1) return true
    return t('hint.violate-slug-rule')
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

const findSlug = useAsyncTask(async () => {
  probSlug.value = await findNextSlug('problem', props.orgId, (n) => `${n}`.padStart(4, '0'))
  return noMessage()
})
</script>

<i18n>
en:
  prob-title: Problem Title
  prob-slug: Problem Slug
  hint:
    violate-title-rule: Title must not be empty.
    violate-slug-rule: Slug must not be empty.
zh-Hans:
  prob-title: 题目标题
  prob-slug: 题目编号
  hint:
    violate-title-rule: 标题不能为空
    violate-slug-rule: 编号不能为空
</i18n>
