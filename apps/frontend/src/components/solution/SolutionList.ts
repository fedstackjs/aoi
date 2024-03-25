import { useRouteQuery } from '@vueuse/router'
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'

import type { IContestProblemListDTO } from '../contest/types'

import type { ISolutionDTO } from './types'

import { useAppState } from '@/stores/app'
import { kContestProblemList } from '@/utils/contest/problem/inject'
import { usePagination } from '@/utils/pagination'
import { denseDateString } from '@/utils/time'

export interface ISolutionListProps {
  orgId: string
  problemId?: string
  contestId?: string
  selfOnly?: boolean
}

export enum SolutionListMode {
  GLOBAL = 0,
  CONTEST = 1,
  PROBLEM = 2
}

export function useSolutionList(props: ISolutionListProps) {
  const { t } = useI18n()

  const app = useAppState()
  const mode = props.problemId
    ? SolutionListMode.PROBLEM
    : props.contestId
      ? SolutionListMode.CONTEST
      : SolutionListMode.GLOBAL
  const problems = inject(kContestProblemList)

  const headers = computed(() => {
    const headers = [
      { title: t('term.state'), key: 'state', align: 'start', sortable: false },
      { title: t('term.user'), key: 'userId', align: 'start', sortable: false }
    ]
    if (mode < 2) {
      headers.push({
        title: t('term.problem-title'),
        key: 'problemTitle',
        align: 'start',
        sortable: false
      })
    }
    if (mode < 1) {
      headers.push({
        title: t('term.contest-title'),
        key: 'contestTitle',
        align: 'start',
        sortable: false
      })
    }
    headers.push(
      { title: t('term.status'), key: 'status', align: 'start', sortable: false },
      { title: t('term.score'), key: 'score', align: 'center', sortable: false },
      { title: t('common.submitted-at'), key: 'submittedAt', align: 'start', sortable: false }
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return headers as any
  })

  const endpoint = computed(() =>
    mode === SolutionListMode.CONTEST
      ? `contest/${props.contestId}/solution`
      : mode === SolutionListMode.PROBLEM
        ? `problem/${props.problemId}/solution`
        : 'solution'
  )
  const filter = {
    userId: useRouteQuery('userId', '', { transform: String }),
    contestId: useRouteQuery('contestId', '', { transform: String }),
    problemId: useRouteQuery('problemId', '', { transform: String }),
    state: useRouteQuery('state', '', { transform: String }),
    status: useRouteQuery('status', '', { transform: String }),
    submittedAtL: useRouteQuery('submittedAtL', '', { transform: String }),
    submittedAtR: useRouteQuery('submittedAtR', '', { transform: String }),
    scoreL: useRouteQuery('scoreL', '', { transform: String }),
    scoreR: useRouteQuery('scoreR', '', { transform: String })
  }
  const actualUserId = computed(() => (props.selfOnly ? app.userId : filter.userId.value))

  const {
    page,
    itemsPerPage,
    result: submissions
  } = usePagination<ISolutionDTO>(
    endpoint,
    computed(() => ({
      ...Object.fromEntries(
        Object.entries(filter)
          .map(([k, v]) => [k, v.value])
          .filter(([, v]) => v)
      ),
      orgId: props.orgId,
      userId: actualUserId.value ? actualUserId.value : undefined
    }))
  )

  const items = computed(() =>
    submissions.state.value.items.map((item) => ({
      ...item,
      problemTitle:
        item.problemTitle ?? problems?.value.find((p) => p._id === item.problemId)?.title ?? '-',
      contestTitle: item.contestTitle ?? '-',
      submittedAtStr: item.submittedAt ? denseDateString(item.submittedAt) : '-',
      problemUrl:
        mode === SolutionListMode.GLOBAL
          ? item.contestId
            ? `/org/${props.orgId}/contest/${item.contestId}/problem/${item.problemId}`
            : `/org/${props.orgId}/problem/${item.problemId}`
          : mode === SolutionListMode.CONTEST
            ? `/org/${props.orgId}/contest/${props.contestId}/problem/${item.problemId}`
            : `/org/${props.orgId}/problem/${props.problemId}`,
      contestUrl: item.contestId && `/org/${props.orgId}/contest/${item.contestId}`,
      solutionUrl:
        mode === SolutionListMode.GLOBAL
          ? item.contestId
            ? `/org/${props.orgId}/contest/${item.contestId}/solution/${item._id}`
            : `/org/${props.orgId}/problem/${item.problemId}/solution/${item._id}`
          : props.contestId
            ? `/org/${props.orgId}/contest/${props.contestId}/solution/${item._id}`
            : `/org/${props.orgId}/problem/${props.problemId}/solution/${item._id}`
    }))
  )

  const isSelf = computed(() => actualUserId.value === app.userId)
  const isAll = computed(() => !actualUserId.value)

  return {
    filter,
    mode,
    headers,
    page,
    itemsPerPage,
    submissions,
    items,
    isSelf,
    isAll
  }
}
