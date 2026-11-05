import { describe, expect, it } from 'vitest'
import {
  buildFundPickerItems,
  buildKindFields,
  getFundActionMessage,
  getGoalDisplay,
  getGoalError,
  goalDateToInput,
  groupFundsByKind,
  isSavings,
  pickDefaultFund,
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

const fmt = (amount) => new Intl.NumberFormat('en-US').format(amount)

describe('groupFundsByKind', () => {
  it('puts accounts first and keeps the API order inside a group', () => {
    const funds = [
      { _id: 's1', kind: 'savings' },
      { _id: 'a1', kind: 'account' },
      { _id: 's2', kind: 'savings' },
      { _id: 'a2' }
    ]

    expect(groupFundsByKind(funds)).toEqual({
      accounts: [funds[1], funds[3]],
      savings: [funds[0], funds[2]]
    })
  })

  it('reads every fund of an API without kind as an account', () => {
    const funds = [{ _id: 'a' }, { _id: 'b' }]

    expect(groupFundsByKind(funds)).toEqual({ accounts: funds, savings: [] })
    expect(isSavings(funds[0])).toBe(false)
  })
})

describe('buildFundPickerItems', () => {
  it('lists accounts first, then savings marked with a pig', () => {
    const none = { _id: null, name: 'No fund' }
    const cash = { _id: 'a', name: 'Cash' }
    const trip = { _id: 's', name: 'Trip', kind: 'savings' }

    expect(buildFundPickerItems([trip, none, cash])).toEqual([
      none,
      cash,
      { ...trip, name: '🐷 Trip' }
    ])
  })

  it('holds only funds: every item has an id key and a name', () => {
    const items = buildFundPickerItems([
      { _id: 's', name: 'Trip', kind: 'savings' },
      { _id: null, name: 'No fund' },
      { _id: 'a', name: 'Cash' }
    ])

    expect(items.every((item) => '_id' in item && typeof item.name === 'string' && !item.type)).toBe(true)
  })

  it('leaves an API without kind as it was', () => {
    const funds = [{ _id: 'a', name: 'Cash' }]

    expect(buildFundPickerItems(funds)).toEqual(funds)
  })
})

describe('pickDefaultFund', () => {
  it('never picks a savings fund, even one flagged as default', () => {
    const funds = [{ _id: 's', kind: 'savings', isDefault: true }, { _id: 'a', isDefault: true }]

    expect(pickDefaultFund(funds)._id).toBe('a')
    expect(pickDefaultFund([funds[0]])).toBeNull()
  })
})

describe('getGoalDisplay', () => {
  const base = { currency: 'THB', currentBalance: 12000, goal: { amount: 30000, date: null } }
  const options = { formatAmount: fmt, symbol: '฿' }

  it('is null without a goal', () => {
    expect(getGoalDisplay({ currentBalance: 5 }, options)).toBeNull()
    expect(getGoalDisplay({ currentBalance: 5, goal: null }, options)).toBeNull()
  })

  it('shows balance / target and no hint without a date', () => {
    const display = getGoalDisplay(
      { ...base, goalProgress: { percent: 40, remaining: 18000, monthsLeft: null, perMonth: null, reached: false } },
      options
    )

    expect(display).toEqual({ percent: 40, reached: false, progressText: '12,000 / 30,000 ฿', hintText: null })
  })

  it('says how much per month until the month of the date', () => {
    const display = getGoalDisplay(
      {
        ...base,
        goal: { amount: 30000, date: '2027-03-15T00:00:00.000Z' },
        goalProgress: { percent: 40, remaining: 18000, monthsLeft: 4, perMonth: 4500, reached: false }
      },
      options
    )

    expect(display.hintText).toBe('≈ 4,500 ฿/month until Mar 2027')
  })

  it('says the goal is reached and caps the bar at 100', () => {
    const display = getGoalDisplay(
      {
        ...base,
        currentBalance: 36000,
        goalProgress: { percent: 120, remaining: 0, monthsLeft: null, perMonth: null, reached: true }
      },
      options
    )

    expect(display).toMatchObject({ percent: 100, reached: true, hintText: 'Goal reached' })
  })

  it('works out the bar from the balance when the API sent no goalProgress', () => {
    expect(getGoalDisplay(base, options)).toMatchObject({ percent: 40, reached: false })
  })
})

describe('buildKindFields', () => {
  it('adds nothing for a new account, so an old API gets today\'s request', () => {
    expect(buildKindFields({ kind: 'account', goalAmount: '', goalDate: '', apiKnowsKind: false })).toEqual({})
  })

  it('clears the goal when an existing fund becomes an account', () => {
    expect(buildKindFields({ kind: 'account', goalAmount: 5, goalDate: '', apiKnowsKind: true })).toEqual({
      kind: 'account',
      goal: null
    })
  })

  it('sends a goal with and without a date, and null when cleared', () => {
    expect(buildKindFields({ kind: 'savings', goalAmount: '30000', goalDate: '2027-03-15' })).toEqual({
      kind: 'savings',
      goal: { amount: 30000, date: '2027-03-15' }
    })
    expect(buildKindFields({ kind: 'savings', goalAmount: 30000, goalDate: '' }).goal).toEqual({
      amount: 30000,
      date: null
    })
    expect(buildKindFields({ kind: 'savings', goalAmount: null, goalDate: null }).goal).toBeNull()
  })
})

describe('getGoalError', () => {
  it('accepts no goal, and a goal with or without a date', () => {
    expect(getGoalError({ goalAmount: '', goalDate: '' })).toBeNull()
    expect(getGoalError({ goalAmount: 10, goalDate: '' })).toBeNull()
    expect(getGoalError({ goalAmount: 10, goalDate: '2027-03-15' })).toBeNull()
  })

  it('refuses a target of 0 or less, and a date without a target', () => {
    expect(getGoalError({ goalAmount: 0, goalDate: '' })).not.toBeNull()
    expect(getGoalError({ goalAmount: -5, goalDate: '' })).not.toBeNull()
    expect(getGoalError({ goalAmount: '', goalDate: '2027-03-15' })).not.toBeNull()
  })
})

describe('goalDateToInput', () => {
  it('gives the calendar day, or nothing', () => {
    expect(goalDateToInput('2027-03-15T00:00:00.000Z')).toBe('2027-03-15')
    expect(goalDateToInput(null)).toBe('')
    expect(goalDateToInput('nonsense')).toBe('')
  })
})
