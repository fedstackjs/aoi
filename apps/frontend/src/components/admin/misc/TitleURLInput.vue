<template>
  <VTable>
    <thead>
      <tr>
        <th class="text-subtitle-1">#</th>
        <th class="text-subtitle-1">{{ t('term.title') }}</th>
        <th class="text-subtitle-1">URL</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, i) in model" :key="i">
        <td>
          <VBtn variant="text" icon="mdi-delete-outline" @click="() => model.splice(i, 1)" />
        </td>
        <td>
          <VTextField dense v-model="item.title" :label="t('term.title')" />
        </td>
        <td>
          <VTextField dense v-model="item.url" label="URL" />
        </td>
      </tr>
      <tr>
        <td>
          <VBtn variant="text" icon="mdi-plus" @click="() => model.push({ title: '', url: '' })" />
        </td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  </VTable>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const model = defineModel<
  [
    {
      title: string
      url: string
    }
  ]
>({ required: true })

const { t } = useI18n()
</script>
