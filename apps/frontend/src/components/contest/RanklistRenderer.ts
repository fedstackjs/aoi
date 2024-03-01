import { useContestCapability, useContestData } from '@/utils/contest/inject'
import { ref } from 'vue'

export function useRanklistRenderer() {
  try {
    const admin = useContestCapability('admin')
    const contest = useContestData()
    const participantUrl = (userId: string) =>
      `/org/${contest.value.orgId}/contest/${contest.value._id}/participant/${userId}`
    return { admin, participantUrl }
  } catch {
    return {
      admin: ref(false),
      participantUrl: () => ''
    }
  }
}
