<template>
  <VMenu v-if="userMenu.length">
    <template v-slot:activator="{ props }">
      <VBtn v-bind="props" icon="mdi-plus" class="text-none" />
    </template>
    <VList>
      <VListItem v-for="(item, i) in userMenu" :key="i" v-bind="item" />
    </VList>
  </VMenu>
</template>

<script setup lang="ts">
import { useAppAddMenu } from '@/utils/menus'

const userMenu = useAppAddMenu()
</script>

<i18n global>
en:
  new-organization: New organization
  new-problem: New problem
  new-contest: New contest
  new-plan: New plan
  new-group: New group
zhHans:
  new-organization: 新建组织
  new-problem: 新建题目
  new-contest: 新建比赛
  new-plan: 新建计划
  new-group: 新建小组
</i18n>
