import { defineRoutes } from '../common/index.js'

export const orgProblemRoutes = defineRoutes(async (s) => {
  s.get(
    '/',
    {
      schema: {
        description: 'List all problems'
      }
    },
    () => ''
  )

  s.post(
    '/',
    {
      schema: {
        description: 'Create a new problem'
      }
    },
    () => ''
  )
})
