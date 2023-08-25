import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'
import { zhHans, en } from 'vuetify/locale'

export default createVuetify({
  blueprint: md3,
  locale: {
    locale: 'zh-Hans',
    fallback: 'en',
    messages: { 'zh-Hans': zhHans, en }
  }
})
