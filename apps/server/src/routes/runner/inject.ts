import { IRunner } from '../../index.js'
import { defineInjectionPoint } from '../../utils/inject.js'

export const kRunnerContext = defineInjectionPoint<{
  _runner: IRunner
}>('runner')
