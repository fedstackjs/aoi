import { useAppState } from '@/stores/app'
import { computed } from 'vue'
import { hasCapability, orgBits, useOrgCapability, useUserCapability, userBits } from './capability'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { logout } from '@/utils/http'

export function useAppAddMenu() {
  const { t } = useI18n()
  const appState = useAppState()
  const orgAdmin = useOrgCapability('admin')
  const userCreateOrg = useUserCapability('createOrg')

  const orgMenu = () => {
    if (!appState.orgId) return []
    return [
      {
        prependIcon: 'mdi-account-multiple',
        title: t('new-group'),
        to: '/group/new',
        show: orgAdmin.value
      },
      {
        prependIcon: 'mdi-notebook',
        title: t('new-problem'),
        to: '/problem/new',
        show: orgAdmin.value
      },
      {
        prependIcon: 'mdi-trophy',
        title: t('new-contest'),
        to: '/contest/new',
        show: orgAdmin.value
      },
      {
        prependIcon: 'mdi-clipboard-clock',
        title: t('new-plan'),
        to: '/plan/new',
        show: orgAdmin.value
      }
    ].map((item) => ({
      ...item,
      to: `/org/${appState.orgId}${item.to}`
    }))
  }

  return computed(() =>
    [
      {
        prependIcon: 'mdi-account-group',
        title: t('new-organization'),
        to: '/org/new',
        show: userCreateOrg.value
      },
      ...orgMenu()
    ].filter((item) => item.show)
  )
}

export function useAppUserMenu() {
  const router = useRouter()
  const { t } = useI18n()
  const app = useAppState()

  return computed(() => [
    {
      prependIcon: 'mdi-account',
      to: `/user/${app.userId}`,
      title: t('pages.user-info'),
      exact: true
    },
    { prependIcon: 'mdi-cog', to: `/user/${app.userId}/settings`, title: t('pages.user-settings') },
    {
      prependIcon: 'mdi-logout',
      action: () => {
        logout()
        router.replace('/')
      },
      title: t('pages.logout')
    }
  ])
}

export function useAppNavMenu() {
  const { t } = useI18n()
  const appState = useAppState()

  const orgItems = () => {
    if (!appState.orgId) return []
    return [
      { prependIcon: 'mdi-list-box', to: '/problem', title: t('pages.problems') },
      { prependIcon: 'mdi-balloon', to: '/contest', title: t('pages.contests') },
      { prependIcon: 'mdi-timer-sand', to: '/solution', title: t('pages.solutions') },
      { prependIcon: 'mdi-clipboard-text-outline', to: '/plan', title: t('pages.plans') },
      { prependIcon: 'mdi-account-multiple', to: '/group', title: t('pages.groups') }
    ].map((item) => ({
      ...item,
      to: `/org/${appState.orgId}${item.to}`
    }))
  }

  const orgAdminItems = () => {
    if (!appState.orgId || !hasCapability(appState.orgCapability, orgBits.admin)) return []
    return [{ prependIcon: 'mdi-cog', to: '/admin', title: t('pages.admin') }].map((item) => ({
      ...item,
      to: `/org/${appState.orgId}${item.to}`
    }))
  }

  const debugItems = () => {
    if (!appState.debug) return []
    return [{ prependIcon: 'mdi-bug', to: '/debug', title: 'Debug Tools' }]
  }

  const adminItems = () => {
    if (!hasCapability(appState.userCapability, userBits.admin)) return []
    return [{ prependIcon: 'mdi-cog', to: '/admin', title: 'Global Admin' }]
  }

  return computed(() => [
    ...orgItems(),
    ...orgAdminItems(),
    { prependIcon: 'mdi-help', to: '/about', title: t('pages.about') },
    { prependIcon: 'mdi-rss', to: '/announcement', title: t('pages.announcements') },
    ...adminItems(),
    ...debugItems()
  ])
}
