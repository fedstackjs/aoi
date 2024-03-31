import { IRuleSet, IRuleSetEvaluateOptions, Projector, evaluateRuleSet } from '@aoi-js/rule'
import { httpErrors } from '@fastify/sensible'
import { Static, TSchema } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

export function createEvaluator<T extends TSchema>(schema: T) {
  const checker = TypeCompiler.Compile(schema)
  type Result = Static<T>
  return <Context>(
    context: Context,
    ruleSet: IRuleSet<Context, Result>,
    options: IRuleSetEvaluateOptions = {},
    fallback?: Projector<Context, Result>
  ) => {
    try {
      const result = evaluateRuleSet(context, ruleSet, options, fallback)
      if (!checker.Check(result)) throw new Error('Invalid rule result')
      return result
    } catch (err) {
      throw httpErrors.preconditionFailed(`${err}`)
    }
  }
}
