/* eslint-disable @typescript-eslint/no-explicit-any */

export type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]-?: K extends string | number ? `${K}` | `${K}.${DeepKeys<T[K]>}` : never
    }[keyof T]
  : never

export type DeepGet<T, K extends string> = K extends `${infer K1}.${infer K2}`
  ? K1 extends keyof T
    ? Extract<T[K1], undefined | null> extends infer U
      ? never extends U
        ? DeepGet<NonNullable<T[K1]>, K2> | U
        : DeepGet<T[K1], K2>
      : never
    : never
  : K extends keyof T
    ? T[K]
    : never

export function deepGet<T, K extends string>(value: T, key: K): DeepGet<T, K> {
  const [cur, next] = key.split('.', 2)
  if (value === null || value === undefined) return value as DeepGet<T, K>
  if (typeof value !== 'object') return undefined as DeepGet<T, K>
  if (!Object.hasOwn(value, cur)) return undefined as DeepGet<T, K>
  if (next === undefined) return value[cur as keyof T] as DeepGet<T, K>
  return deepGet(value[cur as keyof T], key.slice(cur.length + 1)) as DeepGet<T, K>
}

export type ElementType<T> = T extends (infer U)[] ? U : never

export class ConditionOps<Value> {
  $eq = (value: Value, expected: Value) => value === expected
  $ne = (value: Value, expected: Value) => value !== expected

  $gt = (value: Value, expected: Value) => value > expected
  $gte = (value: Value, expected: Value) => value >= expected
  $lt = (value: Value, expected: Value) => value < expected
  $lte = (value: Value, expected: Value) => value <= expected

  $in = (value: Value, expected: Value[]) => Array.isArray(expected) && expected.includes(value)
  $nin = (value: Value, expected: Value[]) => Array.isArray(expected) && !expected.includes(value)

  $startsWith = (value: Value, expected: string) => `${value}`.startsWith(expected)
  $endsWith = (value: Value, expected: string) => `${value}`.endsWith(expected)

  $includes = (value: Value, expected: ElementType<Value>) =>
    Array.isArray(value) && value.includes(expected)
  $includesEach = (value: Value, expected: ElementType<Value>[]) =>
    Array.isArray(value) && Array.isArray(expected) && expected.every((v) => value.includes(v))
  $includesSome = (value: Value, expected: ElementType<Value>[]) =>
    Array.isArray(value) && Array.isArray(expected) && expected.some((v) => value.includes(v))
}

const conditionOps = new ConditionOps()

export type Condition<Value> = {
  [key in keyof ConditionOps<Value>]?: Parameters<ConditionOps<Value>[key]>[1]
}

export function evaluateCondition<Value>(value: Value, condition: Condition<Value>) {
  for (const opName of Object.getOwnPropertyNames(condition)) {
    if (!Object.hasOwn(conditionOps, opName)) throw new Error('Invalid condition')
    const op = conditionOps[opName as keyof ConditionOps<Value>]
    if (!op(value, condition[opName as keyof Condition<Value>] as never)) return false
  }
  return true
}

export type Matcher<Context> = {
  [key in DeepKeys<Context>]?: Condition<DeepGet<Context, key>>
}

export function match<Context>(context: Context, matcher: Matcher<Context>) {
  const keys = Object.getOwnPropertyNames(matcher)
  for (const key of keys) {
    const value = deepGet(context, key)
    const conditions = matcher[key as keyof Matcher<Context>] as Condition<typeof value>
    if (!evaluateCondition(value, conditions)) return false
  }
  return true
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Projector<Context, Result> = {
  [key in keyof Result]: key extends string ? string | DeepGet<Result, key> : never
}

export function evaluateProjection<Context>(context: Context, descriptor: any) {
  if (typeof descriptor !== 'string') return descriptor
  if (descriptor[0] !== '$') return descriptor
  if (descriptor[1] === '$') return descriptor.slice(1)
  if (descriptor[1] === '.') return deepGet(context, descriptor.slice(2))
  throw new Error('Invalid descriptor')
}

export function project<Context, Result>(
  context: Context,
  projector: Projector<Context, Result>
): Result {
  const keys = Object.keys(projector)
  const result = Object.create(null)
  for (const key of keys) {
    Object.defineProperty(result, key, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: evaluateProjection<Context>(
        context,
        projector[key as keyof Projector<Context, Result>]
      )
    })
  }
  return result as Result
}

export interface IRule<Context, Result> {
  match: Matcher<Context> | Matcher<Context>[]
  returns: Projector<Context, Result>
}

export interface IRuleSet<Context, Result> {
  rules: IRule<Context, Result>[]
  defaults?: Projector<Context, Result>
}

export interface IRuleSetEvaluateOptions {
  limit?: number
}

export function evaluateRuleSet<Context, Result>(
  context: Context,
  ruleSet: IRuleSet<Context, Result>,
  options: IRuleSetEvaluateOptions = {},
  fallback?: Projector<Context, Result>
): Result {
  let { limit = 50 } = options
  if (limit === -1) limit = Infinity
  const { rules, defaults } = ruleSet
  for (const rule of rules) {
    const matchers = Array.isArray(rule.match) ? rule.match : [rule.match]
    for (const matcher of matchers) {
      if (limit-- <= 0) throw new Error('Rule limit reached')
      if (match(context, matcher)) return project(context, rule.returns)
    }
  }
  if (defaults) return project(context, defaults)
  if (fallback) return project(context, fallback)
  throw new Error('No rule matched')
}
