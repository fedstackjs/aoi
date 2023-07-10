import type { App } from 'vue'
import i18n from './i18n'
import vuetify from './vuetify'
import pinia from '../stores'
import router from '../router'

export function registerPlugins(app: App) {
  app.use(i18n).use(vuetify).use(router).use(pinia)
}
