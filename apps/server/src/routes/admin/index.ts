import { defineRoutes } from '../common/index.js'

export const adminRoutes = defineRoutes(async (s) => {
  s.get('/', async () => {
    return ''
  })
})
