import { BSON } from 'mongodb'

export function problemDataKey(problemId: BSON.UUID, dataHash: string) {
  return `problem/${problemId}/data/${dataHash}`
}

export function problemAttachmentKey(problemId: BSON.UUID, attachmentKey: string) {
  return `problem/${problemId}/attachment/${attachmentKey}`
}

export function solutionDataKey(solutionId: BSON.UUID) {
  return `solution/${solutionId}/data`
}

export function solutionDetailsKey(solutionId: BSON.UUID) {
  return `solution/${solutionId}/result.json`
}

export function contestAttachmentKey(contestId: BSON.UUID, attachmentKey: string) {
  return `contest/${contestId}/attachment/${attachmentKey}`
}

export function contestRanklistKey(contestId: BSON.UUID, ranklistKey: string) {
  return `contest/${contestId}/ranklist/${ranklistKey}.json`
}
