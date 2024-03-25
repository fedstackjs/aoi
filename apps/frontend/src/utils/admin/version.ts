import { computed, ref, type Ref } from 'vue'

import { appBuildInfo } from '../build'
import { http } from '../http'

export interface IServerInfo {
  serverVersion: string
}

export function useServerInfo() {
  const info = ref<IServerInfo>({
    serverVersion: 'loading'
  })
  http
    .get('admin')
    .json<IServerInfo>()
    .then((j) => (info.value = j))
    .catch(() => (info.value = { serverVersion: 'error' }))
  return { info }
}

export function useVersionImgs(info: Ref<IServerInfo>) {
  const escape = (str: string) => str.replace(/-/g, '--')
  return computed(() => [
    `https://img.shields.io/npm/v/%40aoi-js/server?label=server%20latest`,
    `https://img.shields.io/badge/server%20current-v${escape(info.value.serverVersion)}-red`,
    `https://img.shields.io/npm/v/%40aoi-js/frontend?label=frontend%20latest`,
    `https://img.shields.io/badge/frontend%20current-v${escape(appBuildInfo.version)}-red`
  ])
}
