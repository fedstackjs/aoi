import 'virtual:uno.css'
import '@/styles/main.css'
import { createApp } from 'vue'

import App from '@/App.vue'
import { registerPlugins } from '@/plugins/index'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
