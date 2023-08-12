<template>
  <div class="u-grid u-grid-cols-3">
    <VCheckbox
      density="compact"
      v-for="[key, label] of entries"
      :key="key"
      v-model="model[key]"
      :label="label"
    />
  </div>
</template>

<script setup lang="ts">
import type { IContestStage } from '@/types'

const model = defineModel<IContestStage['settings']>({ required: true })

const keys: {
  [key in keyof IContestStage['settings']]: string
} = {
  registrationEnabled: 'Registration Enabled',
  registrationAllowPublic: 'Registration Allow Public',
  problemEnabled: 'Problem Enabled',
  problemShowTags: 'Problem Show Tags',
  solutionEnabled: 'Solution Enabled',
  solutionAllowSubmit: 'Solution Allow Submit',
  solutionShowOther: 'Solution Allow Other',
  solutionShowOtherDetails: 'Solution Allow Other Details',
  solutionShowOtherData: 'Solution Allow Other Download'
}

const entries = Object.entries(keys) as [keyof IContestStage['settings'], string][]
</script>
