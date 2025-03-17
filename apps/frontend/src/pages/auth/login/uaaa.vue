<template>
  <VCardText class="text-center">
    <VProgressCircular indeterminate />
    <p>{{ t('uaaa-wait') }}</p>
  </VCardText>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { useLogin } from '@/stores/app'
import { useAsyncTask } from '@/utils/async'
import { http, prettyHTTPError } from '@/utils/http'
import { useUAAALogin } from '@/utils/user/uaaa'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { getToken } = useUAAALogin()
const { postLogin } = useLogin()

const task = useAsyncTask(async () => {
  try {
    const resp = await http.post('auth/login', {
      json: {
        provider: 'uaaa',
        payload: {
          token: await getToken()
        }
      }
    })
    const { token } = await resp.json<{ token: string }>()
    postLogin(token)
  } catch (err) {
    router.replace({ path: '/auth/login', query: route.query })
    throw new Error(await prettyHTTPError(err))
  }
})

onMounted(() => {
  task.execute()
})
</script>

<i18n>
en:
  uaaa-wait: Waiting for UAAA...
zh-Hans:
  uaaa-wait: 等待统合身份响应……
</i18n>
