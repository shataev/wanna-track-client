import { describe, expect, it } from 'vitest'
import {
  getFundActionMessage,
  pickActiveFunds,
  pickArchivedFunds,
  withCostFund
} from '@/utils/fund.utils'

describe('pickArchivedFunds', () => {
  it('keeps the funds that carry archivedAt', () => {
    const funds = [{ _id: 'a', archivedAt: '2026-11-05T10:00:00.000Z' }, { _id: 'b', archivedAt: null }]

    expect(pickArchivedFunds({ funds })).toEqual([funds[0]])
  })

  it('shows nothing when an API that ignores ?archived=true answers with the active funds', () => {
    expect(pickArchivedFunds({ funds: [{ _id: 'a' }, { _id: 'b' }], total: { amount: 1 } })).toEqual([])
    expect(pickArchivedFunds(null)).toEqual([])
  })
})

describe('pickActiveFunds', () => {
  it('drops archived funds', () => {
    expect(pickActiveFunds([{ _id: 'a', archivedAt: 'x' }, { _id: 'b' }, { _id: 'c', archivedAt: null }]))
      .toEqual([{ _id: 'b' }, { _id: 'c', archivedAt: null }])
  })
})

describe('withCostFund', () => {
  const FUNDS = [{ _id: null, name: 'No fund' }, { _id: 'f1', name: 'Cash' }]

  it('adds the archived fund the expense sits on, marked as archived', () => {
    const cost = { fund: { _id: 'old', name: 'Old card', currency: 'THB' } }

    expect(withCostFund(FUNDS, cost)).toEqual([
      ...FUNDS,
      { _id: 'old', name: 'Old card (archived)', currency: 'THB', isDefault: false }
    ])
  })

  it('leaves the list alone for an active fund, no fund, or a bare id', () => {
    expect(withCostFund(FUNDS, { fund: { _id: 'f1', name: 'Cash' } })).toBe(FUNDS)
    expect(withCostFund(FUNDS, { fund: null })).toBe(FUNDS)
    expect(withCostFund(FUNDS, { fund: 'old' })).toBe(FUNDS)
  })
})

describe('getFundActionMessage', () => {
  const failure = (status, data) => ({ response: { status, data } })

  it('explains a delete refused for history', () => {
    expect(getFundActionMessage(failure(409, { code: 'fund_has_history' }), 'delete')).toBe(
      'This account has history — it stays in the archive.'
    )
  })

  it('reads a missing archive endpoint as not deployed yet', () => {
    expect(getFundActionMessage(failure(404), 'archive')).toMatch(/not available yet/)
  })

  it('tells a network failure from a refusal', () => {
    expect(getFundActionMessage(new Error('x'), 'restore')).toMatch(/Network error/)
    expect(getFundActionMessage(failure(500), 'restore')).toMatch(/trying to restore/)
  })
})
