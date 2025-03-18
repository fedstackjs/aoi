import { useRouteQuery } from '@vueuse/router'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { IInstanceDTO } from './types'

import { useAppState } from '@/stores/app'
import { useAsyncTask } from '@/utils/async'
import { http } from '@/utils/http'
import { usePagination } from '@/utils/pagination'
import { denseDateString } from '@/utils/time'

export interface IInstanceListProps {
  orgId: string
  problemId?: string
  contestId?: string
  selfOnly?: boolean
}

export enum InstanceListMode {
  GLOBAL = 0,
  CONTEST = 1,
  PROBLEM = 2
}

export function useInstanceList(props: IInstanceListProps) {
  const { t } = useI18n()
  const app = useAppState()
  const mode = props.contestId
    ? InstanceListMode.CONTEST
    : props.problemId
      ? InstanceListMode.PROBLEM
      : InstanceListMode.GLOBAL

  const headers = computed(() => {
    const headers = [
      { title: t('term.state'), key: 'state', align: 'start', sortable: false },
      { title: t('term.user'), key: 'userId', align: 'start', sortable: false },
      { title: t('term.problem-title'), key: 'problemTitle', align: 'start', sortable: false },
      { title: t('term.contest-title'), key: 'contestTitle', align: 'start', sortable: false },
      // { title: t('term.slot-no'), key: 'slotNo', align: 'start', sortable: false },
      { title: t('common.created-at'), key: 'createdAt', align: 'start', sortable: false }
    ]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return headers as any
  })

  const filter = {
    userId: useRouteQuery('userId', '', { transform: String }),
    problemId: useRouteQuery('problemId', '', { transform: String }),
    contestId: useRouteQuery('contestId', '', { transform: String }),
    state: useRouteQuery('state', '', { transform: String })
  }

  const actualUserId = computed(() => (props.selfOnly ? app.userId : filter.userId.value))
  const actualProblemId = computed(() => props.problemId || filter.problemId.value)
  const actualContestId = computed(() => props.contestId || filter.contestId.value)

  const {
    page,
    itemsPerPage,
    result: instances
  } = usePagination<IInstanceDTO>(
    'instance',
    computed(() => ({
      ...Object.fromEntries(
        Object.entries(filter)
          .map(([k, v]) => [k, v.value])
          .filter(([, v]) => v)
      ),
      orgId: props.orgId,
      userId: actualUserId.value ? actualUserId.value : undefined,
      problemId: actualProblemId.value ? actualProblemId.value : undefined,
      contestId: actualContestId.value ? actualContestId.value : undefined
    }))
  )

  const items = computed(() =>
    instances.state.value.items.map((item) => ({
      ...item,
      problemUrl: `/org/${props.orgId}/problem/${item.problemId}`,
      contestUrl: item.contestId ? `/org/${props.orgId}/contest/${item.contestId}` : undefined,
      createdAtStr: item.createdAt ? denseDateString(item.createdAt) : '-'
    }))
  )

  const isSelf = computed(() => actualUserId.value === app.userId)
  const isAll = computed(() => !actualUserId.value)

  // TODO: support contest instance
  const canCreateInstance = computed(() => props.problemId)
  const createInstanceTask = useAsyncTask(async () => {
    switch (mode) {
      case InstanceListMode.PROBLEM: {
        await http.post(`problem/${props.problemId}/instance`)
        instances.execute(0, page.value, itemsPerPage.value)
        return
      }
      case InstanceListMode.CONTEST: {
        await http.post(`contest/${props.contestId}/problem/${props.problemId}/instance`)
        instances.execute(0, page.value, itemsPerPage.value)
        return
      }
    }
  })

  return {
    filter,
    mode,
    headers,
    page,
    itemsPerPage,
    instances,
    items,
    isSelf,
    isAll,
    canCreateInstance,
    createInstanceTask
  }
}
