import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTitle } from '@vueuse/core'

export const useAppState = defineStore('app_state', () => {
  const navBar = ref<boolean>()
  const title = useTitle()
  return { navBar, title }
})
