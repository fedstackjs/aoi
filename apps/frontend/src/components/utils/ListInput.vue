<template>
  <VCard variant="outlined" class="u-flex-1">
    <template v-for="(item, i) of model" :key="i">
      <VCardText>
        <slot :value="item" :index="i" />
      </VCardText>
      <VCardActions>
        <span>{{ t('ith-item', { i: i + 1 }) }}</span>
        <VSpacer />
        <VBtn color="error" variant="outlined" @click="() => model.splice(i, 1)">
          {{ t('action.delete') }}
        </VBtn>
      </VCardActions>
      <VDivider />
    </template>
    <VCardActions>
      <span>
        {{ t('total-items', { num: model.length }) }}
      </span>
      <VSpacer />
      <VBtn color="info" variant="outlined" @click="add">
        {{ t('add') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts" generic="T, S extends T">
import { useI18n } from 'vue-i18n'

const model = defineModel<T[]>({ required: true })
const props = defineProps<{
  init: () => S
}>()
const { t } = useI18n()

function add() {
  model.value.push(props.init())
}
</script>

<i18n>
en:
  ith-item: "item {i}"
  total-items: "{num} items in total"
  add: "Add"

zhHans:
  ith-item: "第{i}项"
  total-items: "共{num}项"
  add: "添加"
</i18n>
