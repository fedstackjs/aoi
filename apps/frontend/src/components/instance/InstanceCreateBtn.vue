<template>
  <VBtn
    v-if="canCreateInstance"
    @click="createInstanceTask.execute()"
    :loading="createInstanceTask.isLoading.value"
    :text="t('create-instance')"
    variant="text"
    class="align-self-center"
    prepend-icon="mdi-codepen"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { type IInstanceCreateBtnProps, useInstanceCreateBtn } from './InstanceCreateBtn'

const { t } = useI18n()
const props = defineProps<IInstanceCreateBtnProps>()
const { canCreateInstance, createInstanceTask } = useInstanceCreateBtn(props)
</script>

<i18n>
en:
  create-instance: "Create Instance"
zh-Hans:
  create-instance: "创建实例"
</i18n>
