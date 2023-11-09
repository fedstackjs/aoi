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
      <VListItemSubtitle class="py-1">
        {{ subtitle }}
      </VListItemSubtitle>
      <template v-slot:append v-if="props.authed">
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
import type { userInfoProfile } from './types'
import { computed } from 'vue'

const { t } = useI18n()

const props = defineProps<{
  profile: userInfoProfile
  userId: string
  authed?: boolean
}>()

const subtitle = computed(() => {
  const pfx = `${props.profile.realname} | ${props.profile.email}`
  if (!props.authed) return pfx
  return (
    pfx +
    ` | ${props.profile.telephone ?? t('ph-tel')}` +
    ` | ${props.profile.studentId ?? t('ph-student-id')}` +
    ` | ${props.profile.studentGrade ?? t('ph-student-grade')}`
  )
})
</script>

<i18n>
en:
  ph-tel: '[Telephone]'
  ph-student-id: '[Student ID]'
  ph-student-grade: '[Student Grade]'
zh-Hans:
  ph-tel: '[电话]'
  ph-student-id: '[学号]'
  ph-student-grade: '[年级]'
</i18n>
