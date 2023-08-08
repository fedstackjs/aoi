import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'
import { en, zhHans } from 'vuetify/locale'

const vuetifyLocale: Record<string, unknown> = { en, zhHans }
for (const key in messages) {
  messages[key].$vuetify = vuetifyLocale[key]
}

export default createI18n({
  legacy: false,
  locale: 'zhHans',
  fallbackLocale: 'en',
  messages
})
