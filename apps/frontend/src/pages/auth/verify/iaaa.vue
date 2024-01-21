<template>
  <VCardText class="text-center">
    <VProgressCircular indeterminate />
    <p>{{ t('iaaa-wait') }}</p>
  </VCardText>
</template>

<script setup lang="ts">
import { useAsyncTask } from '@/utils/async'
import { http, login, prettyHTTPError } from '@/utils/http'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getToken } from '@/utils/user/iaaa'

const { t } = useI18n()
const router = useRouter()

const task = useAsyncTask(async () => {
  try {
    const resp = await http.post('auth/login', {
      json: {
        provider: 'iaaa',
        payload: {
          token: await getToken()
        }
      }
    })
    const { token } = await resp.json<{ token: string }>()
    login(token)
    router.replace('/')
  } catch (err) {
    router.replace('/login')
    throw new Error(await prettyHTTPError(err))
  }
})

onMounted(() => {
  task.execute()
})
</script>

<i18n>
en:
  iaaa-wait: Waiting for IAAA login...
zh-Hans:
  iaaa-wait: 等待 IAAA 登录...
</i18n>
