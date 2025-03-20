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
import { useToast } from 'vue-toastification'

import { useMfa } from '@/stores/app'
import { noMessage, useAsyncTask } from '@/utils/async'
import { http, prettyHTTPError } from '@/utils/http'
import { useUAAALogin } from '@/utils/user/uaaa'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { getToken } = useUAAALogin()
const toast = useToast()
const { postVerify } = useMfa()

const task = useAsyncTask(async () => {
  try {
    const uaaaToken = await getToken('verify')
    if (!uaaaToken) return noMessage()
    const resp = await http.post('auth/verify', {
      json: {
        provider: 'uaaa',
        payload: {
          token: uaaaToken
        }
      }
    })
    const { token } = await resp.json<{ token: string }>()
    toast.success(t('hint.verify-success'))
    postVerify(token)
  } catch (err) {
    router.replace({ path: '/auth/verify', query: route.query })
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
