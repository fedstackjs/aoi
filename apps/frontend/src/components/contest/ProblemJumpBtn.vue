<template>
  <VBtn
    @click="jumpToProblem"
    class="justify-end"
    size="small"
    v-if="canJump"
    prepend-icon="mdi-arrow-top-left"
    variant="outlined"
  >
    {{ t('jump-to-problem') }}
  </VBtn>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { http } from '@/utils/http'
import { useRoute, useRouter } from 'vue-router'
import { ref, watch } from 'vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const props = defineProps<{
  problemId: string
}>()

const canJump = ref(false)

async function updateCanJump() {
  try {
    await http.get(`problem/${props.problemId}`)
    canJump.value = true
  } catch (e) {
    canJump.value = false
  }
}

watch(() => props.problemId, updateCanJump, { immediate: true })

function jumpToProblem() {
  router.push(`/org/${route.params.orgId}/problem/${props.problemId}`)
}
</script>

<i18n>
en:
  jump-to-problem: Jump to problem
zh-Hans:
  jump-to-problem: 跳转到原题目
</i18n>
