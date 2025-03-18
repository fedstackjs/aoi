import { SProblemConfigSchema } from '@aoi-js/common'
import { UUID } from 'mongodb'

import { InstanceState } from '../../db/instance.js'
import { getDownloadUrl, problemDataKey } from '../../oss/index.js'
import { T } from '../../schemas/common.js'
import { defineInjectionPoint } from '../../utils/inject.js'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'

import { kRunnerContext } from './inject.js'

const kRunnerInstanceContext = defineInjectionPoint<{
  _instanceId: UUID
  _taskId: UUID
}>('runnerInstance')

const previousStates = (newState: InstanceState) => {
  switch (newState) {
    case InstanceState.QUEUED:
      return [InstanceState.QUEUED]
    case InstanceState.ACTIVE:
      return [InstanceState.ACTIVE, InstanceState.QUEUED]
    case InstanceState.DESTROYED:
      return [InstanceState.QUEUED, InstanceState.ACTIVE]
    default:
      return []
  }
}

const runnerTaskRoutes = defineRoutes(async (s) => {
  const { instances } = s.db

  s.addHook(
    'onRoute',
    paramSchemaMerger(
      T.Object({
        instanceId: T.UUID(),
        taskId: T.UUID()
      })
    )
  )

  s.addHook('onRequest', async (req) => {
    req.provide(kRunnerInstanceContext, {
      _instanceId: loadUUID(req.params, 'instanceId', s.httpErrors.notFound()),
      _taskId: loadUUID(req.params, 'taskId', s.httpErrors.notFound())
    })
  })

  s.patch(
    '/',
    {
      schema: {
        body: T.Partial(
          T.StrictObject({
            state: T.IntegerEnum(InstanceState),
            message: T.String()
          })
        ),
        response: {
          200: T.Object({})
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kRunnerInstanceContext)
      const state = req.body.state
      const { matchedCount } = await instances.updateOne(
        {
          _id: ctx._instanceId,
          taskId: ctx._taskId,
          state: state ? { $in: previousStates(state) } : { $ne: InstanceState.DESTROYED }
        },
        {
          $set: {
            ...req.body,
            activatedAt: state === InstanceState.ACTIVE ? Date.now() : undefined,
            destroyedAt: state === InstanceState.DESTROYED ? Date.now() : undefined
          }
        },
        { ignoreUndefined: true }
      )
      if (matchedCount === 0) return rep.conflict()
      return {}
    }
  )
})

export const runnerInstanceRoutes = defineRoutes(async (s) => {
  const { orgs, instances, problems } = s.db

  s.addHook('onRequest', async (req, rep) => {
    if (!req.inject(kRunnerContext)._runner.labels.some((label) => label.startsWith('instance:'))) {
      return rep.forbidden()
    }
  })

  s.post(
    '/poll',
    {
      schema: {
        response: {
          200: T.Partial(
            T.Object({
              taskId: T.UUID(),
              instanceId: T.UUID(),
              orgId: T.UUID(),
              userId: T.UUID(),
              problemId: T.UUID(),
              contestId: T.UUID(),
              problemConfig: SProblemConfigSchema,
              problemDataUrl: T.String(),
              problemDataHash: T.String(),
              errMsg: T.String()
            })
          )
        }
      }
    },
    async (req) => {
      const runnerCtx = req.inject(kRunnerContext)
      const taskId = new UUID()
      const instance = await instances.findOneAndUpdate(
        {
          orgId: runnerCtx._runner.orgId,
          state: InstanceState.PENDING,
          label: {
            $in: runnerCtx._runner.labels
              .filter((label) => label.startsWith('instance:'))
              .map((label) => label.replace(/^instance:/, ''))
          }
        },
        { $set: { state: InstanceState.QUEUED, runnerId: runnerCtx._runner._id, taskId } },
        { returnDocument: 'after' }
      )
      if (!instance) return {}
      const info = {
        taskId,
        instanceId: instance._id,
        orgId: instance.orgId,
        userId: instance.userId,
        problemId: instance.problemId,
        contestId: instance.contestId
      }

      const org = await orgs.findOne(
        { _id: runnerCtx._runner.orgId },
        { projection: { 'settings.oss': 1 } }
      )
      const oss = org?.settings.oss
      if (!oss) return { ...info, errMsg: 'OSS not enabled' }
      const problem = await problems.findOne({ _id: instance.problemId })
      if (!problem) return { ...info, errMsg: 'Problem not found' }
      const currentData = problem.data.find(({ hash }) => hash === problem.currentDataHash)
      if (!currentData) return { ...info, errMsg: 'Problem data not found' }

      const problemDataUrl = await getDownloadUrl(
        oss,
        problemDataKey(problem._id, problem.currentDataHash)
      )

      return {
        instanceId: instance._id,
        taskId,
        orgId: instance.orgId,
        userId: instance.userId,
        problemId: instance.problemId,
        contestId: instance.contestId,
        problemConfig: currentData.config,
        problemDataUrl,
        problemDataHash: problem.currentDataHash
      }
    }
  )

  s.register(runnerTaskRoutes, { prefix: '/task/:instanceId/:taskId' })
})
