<template>
  <VContainer v-if="app.debug">
    <VRow>
      <VCol>
        <VCard title="Debug">
          <VCardText>
            <OptionalInput
              v-model="app.overrides['userCapability']"
              :init="() => '-1'"
              empty="User Capability"
            >
              <template v-slot="scoped">
                <VTextField v-model="scoped.value" label="User Capability" />
              </template>
            </OptionalInput>
            <OptionalInput
              v-model="app.overrides['orgCapability']"
              :init="() => '-1'"
              empty="Org Capability"
            >
              <template v-slot="scoped">
                <VTextField v-model="scoped.value" label="Org Capability" />
              </template>
            </OptionalInput>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import OptionalInput from '@/components/utils/OptionalInput.vue'
import { useAppState } from '@/stores/app'
import { useRouter } from 'vue-router'

const app = useAppState()
const router = useRouter()
if (!app.debug) router.replace('/')
</script>
