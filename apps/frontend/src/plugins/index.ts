import type { App } from 'vue'

import router from '../router'
import pinia from '../stores'

import i18n from './i18n'
import toast, { toastOptions } from './toast'
import vuetify from './vuetify'

export function registerPlugins(app: App) {
  app.use(i18n).use(vuetify).use(toast, toastOptions).use(router).use(pinia)
}
