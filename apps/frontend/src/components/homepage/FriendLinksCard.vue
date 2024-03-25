<template>
  <VCard color="grey-lighten-4">
    <VToolbar dark color="grey-lighten-2">
      <VBtn icon="mdi-link-variant" variant="plain" />
      <VToolbarTitle>
        {{ t('friend-links') }}
      </VToolbarTitle>
    </VToolbar>
    <VCardText>
      <VTable class="bg-grey-lighten-4">
        <tbody>
          <AsyncState :state="friendLinks" hide-when-loading>
            <template v-slot="{ value }">
              <tr v-for="(item, i) in value" :key="i">
                <td class="text-body-1">
                  <a :href="item.url" target="_blank" rel="noopener noreferrer">
                    {{ item.title }}
                  </a>
                </td>
              </tr>
            </template>
          </AsyncState>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

import AsyncState from '@/components/utils/AsyncState.vue'
import { http } from '@/utils/http'

const { t } = useI18n()

const friendLinks = useAsyncState(async () => {
  // TODO: implement this api
  const resp = await http.get(`info/friends`)
  return await resp.json<
    Array<{
      title: string
      url: string
    }>
  >()
}, [])
</script>

<i18n>
en:
  friend-links: Friend Links
zh-Hans:
  friend-links: 友情链接
</i18n>
