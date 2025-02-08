#!/usr/bin/env node
import { fastify } from 'fastify'

import { cachePlugin } from '../cache/index.js'
import { ContestStatus, dbPlugin } from '../db/index.js'
import { logger } from '../utils/logger.js'

const server = fastify({ loggerInstance: logger })

await server.register(dbPlugin)
await server.register(cachePlugin)

server.post('/contest/update-status', async () => {
  const { db } = server
  const now = Date.now()
  await db.contests.updateMany(
    // Find contests that need status update
    { $or: [{ nextStatusUpdate: { $lte: now } }, { nextStatusUpdate: { $exists: false } }] },
    [
      {
        $set: {
          nextStatusUpdate: {
            $let: {
              vars: {
                // Find the next stage that will start
                futureStages: {
                  $filter: {
                    input: '$stages',
                    cond: {
                      $lt: [{ $convert: { input: '$$NOW', to: 'double' } }, '$$this.start']
                    },
                    limit: 1
                  }
                }
              },
              in: {
                $cond: {
                  // If there is a future stage, update status when it starts
                  if: { $gte: [{ $size: '$$futureStages' }, 1] },
                  // Use the start time of the next stage
                  then: {
                    $getField: { field: 'start', input: { $arrayElemAt: ['$$futureStages', 0] } }
                  },
                  // Otherwise, never update status again
                  else: Infinity
                }
              }
            }
          },
          status: {
            $let: {
              vars: {
                effectiveStages: {
                  $filter: {
                    input: '$stages',
                    cond: {
                      $lte: [{ $convert: { input: '$$NOW', to: 'double' } }, '$$this.end']
                    },
                    limit: 1
                  }
                }
              },
              in: {
                $let: {
                  vars: {
                    stage: { $arrayElemAt: ['$$effectiveStages', -1] }
                  },
                  in: {
                    $let: {
                      vars: {
                        isLastStage: {
                          $eq: [{ $size: '$$effectiveStages' }, { $size: '$stages' }]
                        },
                        isRunning: {
                          $or: [
                            { $eq: ['$$stage.settings.forceRunning', true] },
                            {
                              $and: [
                                { $eq: ['$$stage.settings.problemEnabled', true] },
                                { $eq: ['$$stage.settings.problemAllowCreateSolution', true] },
                                { $ne: ['$$stage.settings.ranklistSkipCalculation', true] }
                              ]
                            }
                          ]
                        }
                      },
                      in: {
                        $cond: {
                          if: '$$isRunning',
                          then: ContestStatus.RUNNING,
                          else: {
                            $cond: {
                              if: '$$isLastStage',
                              then: ContestStatus.ENDED,
                              else: ContestStatus.PENDING
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  )
  return 0
})

const startAsyncInterval = (fn: CallableFunction, interval: number) => {
  let cancelled = false
  const run = async () => {
    while (!cancelled) {
      await fn()
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
  }
  run()
  return () => {
    cancelled = true
  }
}

// TODO: allow custom interval
startAsyncInterval(async () => {
  const resp = await server.inject({
    method: 'POST',
    url: '/contest/update-status'
  })
  if (resp.statusCode !== 200) {
    server.log.error(`Failed to update contest status: ${resp.payload}`)
  }
}, 1000)
