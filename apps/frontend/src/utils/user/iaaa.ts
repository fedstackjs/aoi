import { type MaybeRef, toRef } from 'vue'

import { sleep, useAsyncTask } from '../async'
import { http } from '../http'

import { useAppState } from '@/stores/app'

const html = `
<form action=https://iaaa.pku.edu.cn/iaaa/oauth.jsp method=post name=iaaa style="display: none">
  <input type=hidden name=appID value="${import.meta.env.VITE_IAAA_APPID}" />
  <input type=hidden name=appName value="${import.meta.env.VITE_IAAA_APPNAME}" />
  <input type=hidden name=redirectUrl value="${import.meta.env.VITE_IAAA_REDIR}" />
</form>
`

export async function getToken() {
  const iframe = document.createElement('iframe')
  iframe.style.background = 'white'
  iframe.style.zIndex = '9999'
  iframe.style.border = 'none'
  iframe.style.position = 'fixed'
  iframe.style.top = '0'
  iframe.style.left = '0'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.src = '/auth/iaaa'
  document.body.appendChild(iframe)
  // const win = window.open('/auth/iaaa', 'iaaa', 'width=800,height=600')
  const client = iframe.contentWindow
  if (!client) throw new Error('Failed to open IAAA window')
  client.document.write(html)
  client.document.forms[0].submit()
  for (;;) {
    try {
      const token = new URLSearchParams(client.document.location.search).get('token')
      if (token) {
        // win.close()
        iframe.remove()
        return token
      }
    } catch (err) {
      //
    }
    await sleep(200)
  }
}

export function useRebindIaaa(userId: MaybeRef<string>) {
  const userIdRef = toRef(userId)
  const app = useAppState()
  const updateTask = useAsyncTask(async () => {
    await http.post(`user/${userIdRef.value}/bind`, {
      json: {
        provider: 'iaaa',
        payload: {
          token: await getToken()
        },
        mfaToken: app.mfaToken
      }
    })
  })
  return { updateTask }
}
