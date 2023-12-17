import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { defineConfig } from 'vite'
import pages from 'vite-plugin-pages'
import uno from 'unocss/vite'
import vueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

const gitHash = execSync('git rev-parse --short HEAD').toString().trim()
const gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()

export default defineConfig({
  build: {
    target: 'esnext'
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
      script: {
        defineModel: true
      }
    }),
    vuetify({
      autoImport: true
    }),
    pages(),
    uno(),
    vueI18nPlugin({
      defaultSFCLang: 'yml',
      include: fileURLToPath(new URL('./src/locales/**', import.meta.url))
    })
  ],
  define: {
    'process.env': {},
    __GIT_HASH__: JSON.stringify(gitHash),
    __GIT_BRANCH__: JSON.stringify(gitBranch),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __APP_NAME__: JSON.stringify(process.env.AOI_APP_NAME ?? 'AOI')
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue']
  },
  server: {
    proxy: {
      '/api': 'http://localhost:1926'
    }
  }
})
