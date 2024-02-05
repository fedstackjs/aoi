import 'virtual:uno.css'
import '@/styles/main.css'
import App from '@/App.vue'
import { createApp } from 'vue'
import { registerPlugins } from '@/plugins/index'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
