import ms from 'ms'
import { ref, computed, onBeforeUnmount } from 'vue'

import type { IPlanContestDTO } from '../plan/types'

import type { IContestDTO } from './types'

export interface IContestProgressBarProps {
  contest: IContestDTO | IPlanContestDTO
}

export interface IContestProgressBarEmits {
  (ev: 'updated'): void
}

export function useContestProgressBar(
  props: IContestProgressBarProps,
  emit: IContestProgressBarEmits
) {
  const now = ref(Date.now())

  const items = computed(() =>
    props.contest.stages.map(({ name }) => ({
      title: name,
      disabled: props.contest.currentStage.name !== name
    }))
  )

  const section = computed(() => {
    const stages = props.contest.stages
    const i = stages.findIndex((stage) => stage.name === props.contest.currentStage.name)
    if (i <= 0 || i >= stages.length - 1) {
      if (i <= 0 && now.value >= stages[1].start) {
        emit('updated')
      }
      return {
        begin: stages[1].start,
        end: stages[stages.length - 1].start,
        progress: i <= 0 ? 0 : 100,
        stopped: i >= stages.length - 1
      }
    }
    const begin = stages[i].start
    const end = stages[i + 1].start
    if (now.value >= end) {
      emit('updated')
    }
    const progress = (100 * (now.value - begin)) / (end - begin)
    return {
      begin,
      end,
      tPlus: ms(now.value - begin),
      tMinus: ms(end - now.value),
      progress
    }
  })

  const intervalId = setInterval(() => {
    now.value = Date.now()
  }, 1000)

  onBeforeUnmount(() => {
    clearInterval(intervalId)
  })

  return { items, section, now }
}
