import { PROBLEM_CAPS, SolutionState, problemRuleSchemas } from '../../db/index.js'
import { SProblemSettings } from '../../index.js'
import { T } from '../../schemas/index.js'
import { ensureCapability } from '../../utils/capability.js'
import { manageACL, manageAccessLevel } from '../common/access.js'
import { defineRoutes, manageRules } from '../common/index.js'
import { manageSettings } from '../common/settings.js'

import { kProblemContext } from './inject.js'

export const problemAdminRoutes = defineRoutes(async (s) => {
  const { problems, solutions } = s.db

  s.addHook('onRequest', async (req) => {
    ensureCapability(
      req.inject(kProblemContext)._problemCapability,
      PROBLEM_CAPS.CAP_ADMIN,
      s.httpErrors.forbidden()
    )
  })

  s.register(manageACL, {
    collection: problems,
    resolve: async (req) => req.inject(kProblemContext)._problemId,
    defaultCapability: PROBLEM_CAPS.CAP_ACCESS,
    prefix: '/access'
  })
  s.register(manageAccessLevel, {
    collection: problems,
    resolve: async (req) => req.inject(kProblemContext)._problemId,
    prefix: '/accessLevel'
  })

  s.register(manageSettings, {
    collection: problems,
    resolve: async (req) => req.inject(kProblemContext)._problemId,
    schema: SProblemSettings,
    prefix: '/settings'
  })

  s.register(manageRules, {
    collection: problems,
    resolve: async (req) => req.inject(kProblemContext)._problemId,
    schemas: problemRuleSchemas,
    prefix: '/rule'
  })

  s.post(
    '/submit-all',
    {
      schema: {
        description: 'Submit all solutions',
        response: {
          200: T.Object({
            modifiedCount: T.Number()
          })
        }
      }
    },
    async (req) => {
      const { modifiedCount } = await solutions.updateMany(
        {
          contestId: { $exists: false },
          problemId: req.inject(kProblemContext)._problemId,
          state: SolutionState.CREATED
        },
        [
          {
            $set: {
              state: SolutionState.PENDING,
              submittedAt: { $convert: { input: '$$NOW', to: 'double' } },
              score: 0,
              status: '',
              metrics: {},
              message: ''
            }
          },
          { $unset: ['taskId', 'runnerId'] }
        ]
      )
      return { modifiedCount }
    }
  )

  s.post(
    '/rejudge-all',
    {
      schema: {
        description: 'Rejudge all solutions',
        body: T.Object({
          pull: T.Optional(T.Boolean())
        }),
        response: {
          200: T.Object({
            modifiedCount: T.Number()
          })
        }
      }
    },
    async (req, rep) => {
      const { pull } = req.body
      const ctx = req.inject(kProblemContext)
      const { data, currentDataHash } = ctx._problem
      const currentData = data.find(({ hash }) => hash === currentDataHash)
      if (!currentData) return rep.preconditionFailed('Current data not found')
      const { config } = currentData

      const { modifiedCount } = await solutions.updateMany(
        {
          contestId: { $exists: false },
          problemId: ctx._problemId,
          state: { $ne: SolutionState.CREATED }
        },
        [
          {
            $set: {
              label: pull ? config.label : undefined,
              problemDataHash: pull ? currentDataHash : undefined,
              state: SolutionState.PENDING,
              score: 0,
              status: '',
              metrics: {},
              message: ''
            }
          },
          { $unset: ['taskId', 'runnerId'] }
        ],
        { ignoreUndefined: true }
      )
      return { modifiedCount }
    }
  )

  s.delete(
    '/',
    {
      schema: {
        description: 'Delete problem'
      }
    },
    async (req) => {
      // TODO: handle dependencies
      await problems.deleteOne({ _id: req.inject(kProblemContext)._problemId })
      return {}
    }
  )
})
