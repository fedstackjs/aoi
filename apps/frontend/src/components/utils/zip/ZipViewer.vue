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
import { shallowRef } from 'vue'
import ZipFileViewer from './ZipFileViewer.vue'

const props = defineProps<{
  zip: JSZip
}>()

const currentFile = shallowRef<JSZip.JSZipObject>()
</script>
