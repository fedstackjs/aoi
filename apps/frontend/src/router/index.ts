import { useAppState } from '@/stores/app'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...routes,
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/components/utils/NotFound.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const appState = useAppState()
  if (to.path.startsWith('/org') && !appState.loggedIn)
    return next({ path: '/auth/login', query: { redirect: to.fullPath } })
  return next()
})

export default router
