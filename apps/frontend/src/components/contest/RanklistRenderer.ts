import { useContestCapability, useContestData } from '@/utils/contest/inject'
import { ref } from 'vue'

export function useRanklistRenderer() {
  try {
    const admin = useContestCapability('admin')
    const contest = useContestData()
    const participantUrl = (userId: string) =>
      `/org/${contest.value.orgId}/contest/${contest.value._id}/participant/${userId}`
    const problemUrl = (problemId?: string) =>
      `/org/${contest.value.orgId}/contest/${contest.value._id}/problem/${problemId}`
    const solutionUrl = (solutionId?: string) =>
      `/org/${contest.value.orgId}/contest/${contest.value._id}/solution/${solutionId}`
    return { admin, participantUrl, problemUrl, solutionUrl }
  } catch {
    return {
      admin: ref(false),
      participantUrl: () => '',
      problemUrl: () => '',
      solutionUrl: () => ''
    }
  }
}
