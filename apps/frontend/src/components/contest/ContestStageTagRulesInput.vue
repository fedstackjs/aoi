<template>
  <VCardText>
    <VBtn variant="tonal" v-if="!model" @click="model = {}">Enable Tag Rules</VBtn>
    <div v-else>
      <VTextField
        v-model="model.copyVerifiedFields"
        append-icon="mdi-delete"
        @click:append="model.copyVerifiedFields = undefined"
        label="Comma separated verified fields to copy"
        placeholder="name,email,realname,telephone,school,studentGrade"
      />
      <VBtn variant="tonal" color="error" @click="model = undefined">Disable Tag Rules</VBtn>
    </div>
  </VCardText>
</template>

<script setup lang="ts">
import type { IContestStage } from '@aoi-js/server'

const model = defineModel<IContestStage['settings']['tagRules']>({ required: true })
</script>
