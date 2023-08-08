<template>
  <VCard variant="flat">
    <VCardText>
      <VTextField label="Name" />
      <VTextField label="Email" type="email" />
    </VCardText>
    <VCardActions>
      <VBtn color="primary">Save</VBtn>
      <VBtn color="error">Reset</VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts"></script>
