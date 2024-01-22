<template>
  <VCard variant="outlined">
    <div class="u-flex u-items-stretch">
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
      <ZipFileViewer class="u-flex-1" v-if="currentFile" :file="currentFile" />
    </div>
  </VCard>
</template>

<script setup lang="ts">
import type JSZip from 'jszip'
import { shallowRef, computed } from 'vue'
import ZipFileViewer from './ZipFileViewer.vue'

const props = defineProps<{
  zip: JSZip
  defaultFile?: string
  showMetadata?: boolean
}>()

const files = computed(() => {
  const keys = Object.keys(props.zip.files)
  if (props.showMetadata) return keys
  return keys.filter((fn) => fn !== '.metadata.json')
})

const showSideBar = computed(() => {
  return files.value.length > 1
})

const currentFile = shallowRef<JSZip.JSZipObject>()

function initialize() {
  // Since the component is loaded after the zip is loaded,
  // we need to set the default file here.
  if (props.defaultFile) {
    currentFile.value = props.zip.file(props.defaultFile) ?? undefined
  }
  if (!currentFile.value && !showSideBar.value) {
    currentFile.value = props.zip.files[files.value[0]]
  }
}
initialize()
</script>
