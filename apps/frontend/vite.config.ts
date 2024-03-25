import { execSync } from 'node:child_process'
import { fileURLToPath, URL } from 'node:url'

import vueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import vue from '@vitejs/plugin-vue'
import uno from 'unocss/vite'
import { defineConfig } from 'vite'
import pages from 'vite-plugin-pages'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

const gitHash = execSync('git rev-parse --short HEAD').toString().trim()
const gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()

process.env.VITE_EXTRA_HEAD ??= ''
process.env.VITE_EXTRA_BODY ??= ''

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
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue']
  },
  server: {
    proxy: {
      '/api': process.env.AOI_URL ?? 'http://localhost:1926'
    }
  }
})
