<template>
  <VBtn
    icon="mdi-delete"
    color="error"
    variant="text"
    size="small"
    :loading="deleteInstanceTask.isLoading.value"
    @click="deleteInstanceTask.execute()"
  />
</template>

<script setup lang="ts">
import { type IInstanceDeleteBtnProps, useInstanceDeleteBtn } from './InstanceDeleteBtn'

const props = defineProps<IInstanceDeleteBtnProps>()
const { deleteInstanceTask } = useInstanceDeleteBtn(props)
</script>
