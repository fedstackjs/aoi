import { useLocalStorage } from '@vueuse/core'
import ky, { HTTPError } from 'ky'
import { computed } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const token = useLocalStorage('aoi-auth-token', '')
export const isLoggedIn = computed(() => !!token.value)
export const userId = computed(
  () => token.value && JSON.parse(atob(token.value.split('.')[1])).userId
)

export const http: typeof ky = ky.create({
  prefixUrl: '/api',
  hooks: {
    beforeRequest: [
      (req) => {
        token.value && req.headers.set('Authorization', `Bearer ${token.value}`)
      }
    ],
    beforeError: [
      (err: HTTPError) => {
        if (err.response.status === 401) {
          if (err.message === 'Authorization token expired' && token.value) {
            toast.error('msg.session-expired')
            logout()
          }
        }
        return err
      }
    ]
  }
})

export function logout() {
  token.value = ''
}

export function login(_token: string) {
  token.value = _token
}
