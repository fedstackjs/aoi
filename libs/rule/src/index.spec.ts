import * as assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { deepGet, evaluateCondition, evaluateProjection, evaluateRuleSet, match } from './index.js'

describe('deepGet', () => {
  const obj = { a: { b: 1, c: { d: '' }, e: [0, { f: 'a' }] }, g: null }
  it('should work with deep access', () => {
    assert.equal(deepGet(obj, 'a.b'), 1)
    assert.equal(deepGet(obj, 'a.c.d'), '')
    assert.equal(deepGet(obj, 'a.e.0'), 0)
    assert.equal(deepGet(obj, 'a.e.1.f'), 'a')
    assert.equal(deepGet(obj, 'g'), null)
  })
  it('should return nullish value if key does not exist', () => {
    assert.equal(deepGet(obj, 'a.z'), undefined)
    assert.equal(deepGet(obj, 'a.z.z'), undefined)
    assert.equal(deepGet(obj, 'g.z'), null)
    assert.equal(deepGet(obj, '__proto__'), undefined)
    assert.equal(deepGet(obj, 'constructor'), undefined)
  })
})

describe('condition', () => {
  it('should work with $eq', () => {
    assert.equal(evaluateCondition(1, { $eq: 1 }), true)
    assert.equal(evaluateCondition(1, { $eq: 2 }), false)
    assert.equal(evaluateCondition('1', { $eq: '1' }), true)
    assert.equal(evaluateCondition('1', { $eq: '2' }), false)
    // @ts-expect-error: invalid condition
    assert.equal(evaluateCondition(1, { $eq: '1' }), false)
    // @ts-expect-error: invalid condition
    assert.throws(() => evaluateCondition(1, { constructor: 1 }))
  })

  it('should work with $ne', () => {
    assert.equal(evaluateCondition(1, { $ne: 1 }), false)
    assert.equal(evaluateCondition(1, { $ne: 2 }), true)
    assert.equal(evaluateCondition('1', { $ne: '1' }), false)
    assert.equal(evaluateCondition('1', { $ne: '2' }), true)
    // @ts-expect-error: invalid condition
    assert.equal(evaluateCondition(1, { $ne: '1' }), true)
  })

  it('should work with $gt', () => {
    assert.equal(evaluateCondition(1, { $gt: 1 }), false)
    assert.equal(evaluateCondition(1, { $gt: 0 }), true)
    assert.equal(evaluateCondition(1, { $gt: 2 }), false)
    // @ts-expect-error: invalid condition
    assert.equal(evaluateCondition(1, { $gt: '0' }), true)
  })

  it('should work with $gte', () => {
    assert.equal(evaluateCondition(1, { $gte: 1 }), true)
    assert.equal(evaluateCondition(1, { $gte: 0 }), true)
    assert.equal(evaluateCondition(1, { $gte: 2 }), false)
    // @ts-expect-error: invalid condition
    assert.equal(evaluateCondition(1, { $gte: '1' }), true)
  })

  it('should work with $lt', () => {
    assert.equal(evaluateCondition(1, { $lt: 1 }), false)
    assert.equal(evaluateCondition(1, { $lt: 0 }), false)
    assert.equal(evaluateCondition(1, { $lt: 2 }), true)
    // @ts-expect-error: invalid condition
    assert.equal(evaluateCondition(1, { $lt: '2' }), true)
  })

  it('should work with $lte', () => {
    assert.equal(evaluateCondition(1, { $lte: 1 }), true)
    assert.equal(evaluateCondition(1, { $lte: 0 }), false)
    assert.equal(evaluateCondition(1, { $lte: 2 }), true)
    // @ts-expect-error: invalid condition
    assert.equal(evaluateCondition(1, { $lte: '1' }), true)
  })

  it('should work with $in', () => {
    assert.equal(evaluateCondition(1, { $in: [1, 2] }), true)
    assert.equal(evaluateCondition(1, { $in: [2, 3] }), false)
    // @ts-expect-error: invalid condition
    assert.equal(evaluateCondition(1, { $in: 1 }), false)
  })

  it('should work with $nin', () => {
    assert.equal(evaluateCondition(1, { $nin: [1, 2] }), false)
    assert.equal(evaluateCondition(1, { $nin: [2, 3] }), true)
    // @ts-expect-error: invalid condition
    assert.equal(evaluateCondition(1, { $nin: 1 }), false)
  })

  it('should work with $startsWith', () => {
    assert.equal(evaluateCondition('abc', { $startsWith: 'a' }), true)
    assert.equal(evaluateCondition('abc', { $startsWith: 'b' }), false)
    assert.equal(evaluateCondition(1, { $startsWith: '1' }), true)
  })

  it('should work with $endsWith', () => {
    assert.equal(evaluateCondition('abc', { $endsWith: 'c' }), true)
    assert.equal(evaluateCondition('abc', { $endsWith: 'b' }), false)
    assert.equal(evaluateCondition(1, { $endsWith: '1' }), true)
  })
})

describe('matcher', () => {
  const obj = { a: { b: 1, c: '123' } }
  it('should work with deep access', () => {
    assert.equal(match(obj, { 'a.b': { $eq: 1 } }), true)
  })
  it('should work with no-exist keys', () => {
    // @ts-expect-error: invalid key
    assert.equal(match(obj, { 'a.b.c': { $eq: 1 } }), false)
    // @ts-expect-error: invalid key
    assert.equal(match(obj, { 'a.b.c': { $eq: undefined } }), true)
    // @ts-expect-error: invalid key
    assert.equal(match(obj, { constructor: { $eq: 1 } }), false)
    assert.equal(match(obj, JSON.parse('{ "__proto__": { "$eq": 1 } }')), false)
  })
})

describe('projector', () => {
  const ctx = { a: { b: 1, c: '123' } }
  it('should work with literals', () => {
    assert.equal(evaluateProjection(ctx, 'a'), 'a')
    assert.equal(evaluateProjection(ctx, '$$a'), '$a')
    assert.equal(evaluateProjection(ctx, 123), 123)
    assert.deepEqual(evaluateProjection(ctx, { a: 'a' }), { a: 'a' })
  })

  it('should work with references', () => {
    assert.equal(evaluateProjection(ctx, '$.a'), ctx.a)
    assert.equal(evaluateProjection(ctx, '$.a.b'), ctx.a.b)
    assert.equal(evaluateProjection(ctx, '$.a.c'), ctx.a.c)
  })
})

describe('rule', () => {
  const ctx = { a: { b: 1, c: '123' } }
  it('should evaluate', () => {
    assert.deepEqual(
      evaluateRuleSet(ctx, {
        rules: [
          { match: { 'a.c': { $ne: '123' } }, returns: { x: '$.a.c' } },
          { match: { 'a.b': { $eq: 1 } }, returns: { x: '$.a.b' } }
        ]
      }).x,
      1
    )
  })
  it('should not exceed limit', () => {
    assert.throws(() =>
      evaluateRuleSet(
        ctx,
        {
          rules: [
            { match: { 'a.c': { $ne: '123' } }, returns: { x: '$.a.c' } },
            { match: { 'a.b': { $eq: 1 } }, returns: { x: '$.a.b' } }
          ]
        },
        { limit: 1 }
      )
    )
  })
})
