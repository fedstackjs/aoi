<template>
  <VInput :append-icon="isEmpty ? 'mdi-plus' : 'mdi-delete'" @click:append="onAppendClick">
    <template v-if="isEmpty">
      <slot name="empty">
        <VAlert type="info" :text="t('is-not-set', { field: empty ?? t('this-field') })" />
      </slot>
    </template>
    <template v-else>
      <slot :value="model as T" />
    </template>
  </VInput>
</template>

<script setup lang="ts" generic="T">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const model = defineModel<T | undefined>({ required: false })
const props = defineProps<{
  init: () => T
  empty?: string
}>()
const { t } = useI18n()
const isEmpty = computed(() => model.value === undefined)

function onAppendClick() {
  if (isEmpty.value) {
    model.value = props.init()
  } else {
    model.value = undefined
  }
}
</script>

<i18n>
en:
  is-not-set: "{field} is not set"
  this-field: "This field"
zh-Hans:
  is-not-set: "{field}未设置"
  this-field: "该字段"
</i18n>
