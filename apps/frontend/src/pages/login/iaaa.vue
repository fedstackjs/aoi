<template>
  <VCardText class="text-center">
    <VProgressCircular indeterminate />
    <p>{{ t('iaaa-wait') }}</p>
  </VCardText>
</template>

<script setup lang="ts">
import { useAsyncTask, sleep } from '@/utils/async'
import { http, login } from '@/utils/http'
import { HTTPError } from 'ky'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

const html = `
<form action=https://iaaa.pku.edu.cn/iaaa/oauth.jsp method=post name=iaaa style="display: none">
  <input type=hidden name=appID value="${import.meta.env.VITE_IAAA_APPID}" />
  <input type=hidden name=appName value="${import.meta.env.VITE_IAAA_APPNAME}" />
  <input type=hidden name=redirectUrl value="${import.meta.env.VITE_IAAA_REDIR}" />
</form>
`

async function getToken() {
  const win = window.open('/auth/iaaa', 'iaaa', 'width=800,height=600')
  const client = win?.window
  if (!client) throw new Error('Failed to open IAAA window')
  client.document.write(html)
  client.document.forms[0].submit()
  for (;;) {
    try {
      const token = new URLSearchParams(client.document.location.search).get('token')
      if (token) {
        win.close()
        return token
      }
    } catch (err) {
      //
    }
    await sleep(200)
  }
}

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
    toast.success(t('hint.signin-success'))
    login(token)
    router.replace('/')
  } catch (err) {
    router.replace('/login')
    let msg = `${err}`
    if (err instanceof HTTPError) {
      msg = await err.response
        .json()
        .then(({ message }) => message)
        .catch((err) => `${err}`)
    }
    throw new Error(msg)
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
