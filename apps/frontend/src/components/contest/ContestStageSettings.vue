<template>
  <div class="u-grid u-grid-cols-3">
    <VCheckbox v-model="model.registrationEnabled" label="Registration Enabled" />
    <VCheckbox v-model="model.registrationAllowPublic" label="Registration Allow Public" />
    <VCheckbox v-model="model.problemEnabled" label="Problem Enabled" />
    <VCheckbox v-model="model.problemShowTags" label="Problem Show Tags" />
    <VCheckbox v-model="model.submitEnabled" label="Submit Enabled" />
    <VCheckbox v-model="model.solutionAllowOther" label="Solution Allow Other" />
    <VCheckbox v-model="model.solutionAllowOtherDetails" label="Solution Allow Other Details" />
    <VCheckbox v-model="model.solutionAllowOtherDownload" label="Solution Allow Other Download" />
  </div>
</template>

<script setup lang="ts">
import type { IContestStage } from '@/types'

const model = defineModel<IContestStage['settings']>({ required: true })
</script>
