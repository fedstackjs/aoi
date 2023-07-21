<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('new-contest')">
          <VCardText>
            <!--  -->
          </VCardText>
          <VCardActions>
            <VBtn color="primary" variant="elevated" @click="create">{{ t('create') }}</VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

withTitle(computed(() => t('new-contest')))

async function create() {
  //
}
</script>
