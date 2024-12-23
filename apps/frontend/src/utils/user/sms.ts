import { ref, type MaybeRef, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useAsyncTask, withMessage } from '../async'
import { http } from '../http'
import { useVaptcha } from '../vaptcha'

import { useAppState } from '@/stores/app'

export function useChangePhone(userId: MaybeRef<string>) {
  const newPhone = ref('')
  const code = ref('')
  const userIdRef = toRef(userId)
  const app = useAppState()
  const { token } = useVaptcha({ onPass: (token) => sendTask.execute(token) })
  const { t } = useI18n()

  const sendTask = useAsyncTask(async (token: string) => {
    await http.post(`user/${userIdRef.value}/preBind`, {
      json: {
        provider: 'sms',
        payload: {
          phone: newPhone.value,
          token
        },
        mfaToken: app.mfaToken
      }
    })
    return withMessage(t('msg.code-sent'))
  })
  const updateTask = useAsyncTask(async () => {
    await http.post(`user/${userIdRef.value}/bind`, {
      json: {
        provider: 'sms',
        payload: {
          code: code.value,
          phone: newPhone.value
        },
        mfaToken: app.mfaToken
      }
    })
  })
  return { newPhone, code, token, sendTask, updateTask }
}
