<template>
  <VCard>
    <VParallax src="https://cdn.vuetifyjs.com/images/parallax/material.jpg" height="300">
    </VParallax>
    <VListItem class="ma-4">
      <template v-slot:prepend>
        <VAvatar>
          <AppGravatar :email="props.profile.email" />
        </VAvatar>
      </template>
      <VListItemTitle class="text-h6">
        {{ props.profile.name }}
      </VListItemTitle>
      <VListItemSubtitle>
        {{ props.profile.realname }} | {{ props.profile.email }}
      </VListItemSubtitle>
      <template v-slot:append v-if="props.showSettings">
        <VBtn
          :label="t('user-settings')"
          :to="`/user/${props.userId}/settings`"
          icon="mdi-cog-outline"
          variant="text"
        />
      </template>
    </VListItem>
  </VCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppGravatar from '../app/AppGravatar.vue'

const { t } = useI18n()

const props = defineProps<{
  profile: {
    name: string
    email: string
    realname: string
  }
  userId: string
  showSettings?: boolean
}>()
</script>
