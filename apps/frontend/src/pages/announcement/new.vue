<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('new-announcement')">
          <VCardText>
            <VTextField v-model="payload.title" :label="t('term.title')" />
            <VTextField v-model="payload.date" :label="t('term.date')" type="datetime-local" />
            <VCheckbox :label="t('is-public')" v-model="payload.public" />
          </VCardText>
          <VCardActions>
            <VBtn color="primary" variant="elevated" @click="create">{{ t('action.create') }}</VBtn>
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
import { useToast } from 'vue-toastification'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()

withTitle(computed(() => t('new-announcement')))

const payload = reactive({
  title: '',
  public: false,
  date: ''
})

async function create() {
  if (payload.title === '') return toast.error('Title must not be empty')
  if (Number.isNaN(+new Date(payload.date))) return toast.error('Invalid date')
  const resp = await http.post(`announcement`, { json: payload })
  const { articleId } = await resp.json<{ articleId: string }>()
  router.replace(`/announcement/${articleId}`)
}
</script>

<i18n>
en:
  new-announcement: New Announcement
  is-public: Is Public
zh-Hans:
  new-announcement: 新公告
  is-public: 是否公开
</i18n>
