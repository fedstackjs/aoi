import { ref, type MaybeRef, toRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { noMessage, useAsyncTask, withMessage } from '../async'
import { http } from '../http'
import { useVaptcha } from '../vaptcha'

import { useAppState } from '@/stores/app'

export function useChangePhone(userId: MaybeRef<string>) {
  const newPhone = ref('')
  const code = ref('')
  const userIdRef = toRef(userId)
  const phoneRules = [
    (value: string) => {
      const re = /^1\d{10}$/
      if (re.test(value)) return true
      return t('hint.violate-phone-rule')
    }
  ]
  const phoneValid = computed(() => phoneRules.every((rule) => rule(newPhone.value) === true))
  const app = useAppState()
  const { token } = useVaptcha({ onPass: (token) => sendTask.execute(token) })
  const { t } = useI18n()
  const codeSent = ref(false)

  const sendTask = useAsyncTask(async (token: string) => {
    if (!phoneValid.value) return noMessage()
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
    codeSent.value = true
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
  return { newPhone, code, token, sendTask, updateTask, phoneRules, phoneValid, codeSent }
}
