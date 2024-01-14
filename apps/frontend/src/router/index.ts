import { useAppState } from '@/stores/app'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const appState = useAppState()
  if (to.path.startsWith('/org') && !appState.loggedIn) return next('/login')
  return next()
})

export default router
