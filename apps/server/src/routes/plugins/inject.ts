import { fastifyPlugin } from 'fastify-plugin'
import { IContainer, createInjectionContainer } from '../../utils/index.js'

declare module 'fastify' {
  interface FastifyRequest {
    _now: number
    _container: IContainer
  }
}

export const apiInjectPlugin = fastifyPlugin(async (s) => {
  s.addHook('onRequest', async (req) => {
    req._now = Date.now()
    req._container = createInjectionContainer()
  })
})
