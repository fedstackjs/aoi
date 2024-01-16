<template>
  <article v-html="rendered" class="markdown-body"></article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '@/utils/md'
import 'github-markdown-css/github-markdown-light.css'
import 'katex/dist/katex.min.css'

const props = defineProps<{
  md: string
}>()

const rendered = computed(() => renderMarkdown(props.md))
</script>
