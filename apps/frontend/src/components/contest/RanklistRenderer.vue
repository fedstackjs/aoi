<template>
  <template v-if="ranklist.topstar">
    <VCard flat>
      <!-- Topstar -->
      <RanklistTopstars :topstar="ranklist.topstar" />
    </VCard>
    <VDivider />
  </template>
  <VCard flat>
    <VTable>
      <thead>
        <th>{{ t('term.rank') }}</th>
        <th>{{ t('term.participant') }}</th>
        <th v-for="(header, i) in ranklist.participant.columns" :key="i">
          <component
            :is="header.problemId ? RouterLink : 'span'"
            :to="problemUrl(header.problemId)"
          >
            {{ header.name }}
          </component>
        </th>
      </thead>
      <tbody>
        <tr
          v-for="man in ranklist.participant.list.slice((page - 1) * perPage, page * perPage)"
          :key="man.userId"
        >
          <td>{{ man.rank }}</td>
          <td class="u-flex u-items-center">
            <PrincipalProfile
              :principal-id="man.userId"
              :to="admin ? participantUrl(man.userId) : undefined"
            />
            <div v-if="man.tags" class="u-pl-2 u-flex u-items-center u-gap-2">
              <div v-for="(tag, i) of man.tags" :key="i">
                <VTooltip v-if="tag.startsWith('!star:')" :text="tag.slice(6)">
                  <template v-slot:activator="{ props }">
                    <VIcon color="warning" v-bind="props">mdi-star</VIcon>
                  </template>
                </VTooltip>
                <VChip v-else>{{ tag }}</VChip>
              </div>
            </div>
          </td>
          <td v-for="(column, i) in man.columns" :key="i">
            <component
              :is="column.solutionId ? RouterLink : 'div'"
              :to="solutionUrl(column.solutionId)"
            >
              <article v-html="renderMarkdown(column.content)"></article>
            </component>
          </td>
        </tr>
      </tbody>
    </VTable>
    <VDivider />
    <VPagination v-model="page" :length="length" />
  </VCard>
</template>

<script setup lang="ts">
import type { Ranklist } from '@aoi-js/common'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import RanklistTopstars from '../contest/RanklistTopstars.vue'

import { useRanklistRenderer } from './RanklistRenderer'

import PrincipalProfile from '@/components/utils/PrincipalProfile.vue'
import { renderMarkdown } from '@/utils/md'

const props = defineProps<{
  ranklist: Ranklist
}>()

const { t } = useI18n()

const perPage = ref(50)
const page = ref(1)
const length = computed(() =>
  Math.max(1, Math.ceil(props.ranklist.participant.list.length / perPage.value))
)

const { admin, participantUrl, problemUrl, solutionUrl } = useRanklistRenderer()
</script>
