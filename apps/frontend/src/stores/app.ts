import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTitle } from '@vueuse/core'
import { isLoggedIn } from '@/utils/http'

export const useAppState = defineStore('app_state', () => {
  const navBar = ref<boolean>()
  const title = useTitle()
  const loggedIn = isLoggedIn
  const userName = ref<string>('Fu Shuibo')
  return {
    navBar,
    title,
    loggedIn,
    userName
  }
})
