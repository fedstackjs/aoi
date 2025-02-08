<template>
  <VCard variant="outlined" class="u-resize-y d-flex items-stretch">
    <div class="u-flex-1 u-flex u-items-stretch">
      <template v-if="showSideBar">
        <div>
          <VList density="compact">
            <VListItem
              v-for="name in files"
              :key="zip.files[name].name"
              :title="zip.files[name].name"
              @click="currentFile = zip.files[name]"
            />
          </VList>
        </div>
        <VDivider vertical />
      </template>
      <ArchiveFileViewer class="u-flex-1" v-if="currentFile" :file="currentFile" />
      <div class="u-flex-1 d-flex flex-column justify-center align-center py-8" v-else>
        <VIcon size="128">
          <AoiLogo />
        </VIcon>
        <div>{{ t('select-a-file-to-view') }}</div>
      </div>
    </div>
  </VCard>
</template>

<script setup lang="ts">
import type JSZip from 'jszip'
import { shallowRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ArchiveFileViewer from './ArchiveFileViewer.vue'

import AoiLogo from '@/components/aoi/AoiLogo.vue'

const props = defineProps<{
  zip: JSZip
  defaultFile?: string
  showMetadata?: boolean
}>()

const { t } = useI18n()

const files = computed(() => {
  const keys = Object.keys(props.zip.files).filter((key) => props.zip.file(key)?.dir === false)
  if (props.showMetadata) return keys
  return keys.filter((fn) => fn !== '.metadata.json')
})

const showSideBar = computed(() => {
  return files.value.length > 1
})

const currentFile = shallowRef<JSZip.JSZipObject>()

function initialize() {
  // TODO: enhance default file selection
  if (props.defaultFile) {
    currentFile.value = props.zip.file(props.defaultFile) ?? undefined
  }
  if (!currentFile.value && !showSideBar.value) {
    currentFile.value = props.zip.files[files.value[0]]
  }
}
initialize()
</script>

<i18n>
en:
  select-a-file-to-view: "Select a file to view"

zh-Hans:
  select-a-file-to-view: "选择一个文件以查看"
</i18n>
