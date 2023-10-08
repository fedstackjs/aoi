<template>
  <VCard variant="outlined">
    <div class="u-flex u-items-stretch">
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
      <ZipFileViewer class="u-flex-1" v-if="currentFile" :file="currentFile" />
    </div>
  </VCard>
</template>

<script setup lang="ts">
import type JSZip from 'jszip'
import { shallowRef, watch } from 'vue'
import ZipFileViewer from './ZipFileViewer.vue'

const props = defineProps<{
  zip: JSZip
  defaultFile?: string
}>()

const currentFile = shallowRef<JSZip.JSZipObject>()

watch(
  () => props.zip,
  (zip) => {
    if (props.defaultFile) {
      currentFile.value = zip.file(props.defaultFile) ?? undefined
    }
  }
)
</script>
