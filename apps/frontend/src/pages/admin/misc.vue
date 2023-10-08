<template>
  <VCard variant="flat">
    <VDivider />
    <VCardSubtitle>{{ t('misc-poster') }}</VCardSubtitle>
    <SettingsEditor endpoint="info/posters">
      <template v-slot="scoped">
        <TitleURLInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
    <VDivider />
    <VCardSubtitle>{{ t('misc-friends') }}</VCardSubtitle>
    <SettingsEditor endpoint="info/friends">
      <template v-slot="scoped">
        <TitleURLInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
    <VDivider />
    <VCardSubtitle>{{ t('misc-milestone') }}</VCardSubtitle>
    <SettingsEditor endpoint="info/milestone">
      <template v-slot="scoped">
        <MilestoneSettingsInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
  </VCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SettingsEditor from '@/components/utils/SettingsEditor.vue'
import MilestoneSettingsInput from '@/components/admin/misc/MilestoneSettingsInput.vue'
import TitleURLInput from '@/components/admin/misc/TitleURLInput.vue'

const { t } = useI18n()
</script>

<i18n>
en:
  misc-poster: Poster Settings
  misc-friends: Friend Links Settings
  misc-milestone: Milestone Settings
zh-Hans:
  misc-poster: 海报设置
  misc-friends: 友情链接设置
  misc-milestone: 里程碑设置
</i18n>
