import type { App } from 'vue'
import i18n from './i18n'
import vuetify from './vuetify'
import toast, { toastOptions } from './toast'
import pinia from '../stores'
import router from '../router'

export function registerPlugins(app: App) {
  app.use(i18n).use(vuetify).use(toast, toastOptions).use(router).use(pinia)
}
