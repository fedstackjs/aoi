<template>
  <VAutocomplete
    v-model="model"
    :items="problems"
    item-value="_id"
    item-title="_id"
    no-filter
    v-bind="$attrs"
  >
    <template #item="{ props, item }">
      <VListItem v-bind="props">
        <template #title>
          <VListItemTitle>
            {{ item.raw.title }}
            <span class="text-secondary">{{ item.raw.settings.slug }}</span>
          </VListItemTitle>
        </template>
        <VListItemSubtitle>
          <code>{{ item.raw._id }}</code>
        </VListItemSubtitle>
      </VListItem>
    </template>
  </VAutocomplete>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { kContestProblemList } from '@/utils/contest/problem/inject'

const model = defineModel<string>({ required: true })

const problems = inject(kContestProblemList) ?? []
</script>
