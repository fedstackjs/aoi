import { FastifyRequest } from 'fastify'
import { tryLoadUUID } from '../../common/index.js'
import { kContestContext } from '../inject.js'

export function loadProblemSettings(req: FastifyRequest) {
  const problemId = tryLoadUUID(req.params, 'problemId')
  if (!problemId) return [null, undefined] as const
  const ctx = req.inject(kContestContext)
  const settings = ctx._contest.problems.find((problem) => problemId.equals(problem.problemId))
    ?.settings
  return [problemId, settings] as const
}
