<template>
  <VCard variant="outlined">
    <div class="u-flex u-items-stretch">
      <template v-if="showSideBar">
        <div>
          <VList density="compact">
            <VListItem
              v-for="file in props.zip.files"
              :key="file.name"
              :title="file.name"
              @click="currentFile = file"
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
}>()

const showSideBar = computed(() => {
  // show iff there are more than one files, excluding .metadata.json
  return Object.keys(props.zip.files).filter((fn) => fn !== '.metadata.json').length > 1
})

const currentFile = shallowRef<JSZip.JSZipObject>()

function initialize() {
  // Since the component is loaded after the zip is loaded,
  // we need to set the default file here.
  if (props.defaultFile) {
    currentFile.value = props.zip.file(props.defaultFile) ?? undefined
  }
  if (!currentFile.value && Object.keys(props.zip.files).length == 1) {
    currentFile.value = props.zip.files[Object.keys(props.zip.files)[0]]
  }
}
initialize()
</script>
