import { describe, expect, it } from 'vitest'
import {
  describeBudgetRow,
  formatBudgetValue,
  getBudgetBar,
  getBudgetColors,
  getLimitPrefill,
  getRemainingPerDay,
  hasBudgetState,
  parseLimit,
  withBudgetOnlyCategories
} from '@/utils/budget.utils'
import { ALERT_COLORS, DELTA_COLORS } from '@/constants/colors.constants'

const period = { daysInMonth: 30, elapsedDays: 5 }
const money = (amount, currency) => `${amount} ${currency}`

describe('getBudgetColors', () => {
  it('maps each state to the palette, with no red', () => {
    expect(getBudgetColors('on_track').backgroundColor).toBe(DELTA_COLORS.down.backgroundColor)
    expect(getBudgetColors('ahead').backgroundColor).toBe('#FFDA4D')
    expect(getBudgetColors('over')).toEqual(ALERT_COLORS)
  })

  it('has none without a state', () => {
    expect(getBudgetColors(null)).toBeNull()
    expect(getBudgetColors('unknown')).toBeNull()
  })
})

describe('hasBudgetState', () => {
  it('needs a known state: a currency mismatch comes back without one', () => {
    expect(hasBudgetState({ state: 'ahead' })).toBe(true)
    expect(hasBudgetState({ state: null, currencyMismatch: true })).toBe(false)
    expect(hasBudgetState(undefined)).toBe(false)
  })
})

describe('getRemainingPerDay', () => {
  it('divides the remainder by the days left, today included', () => {
    // 26 days left on day 5 of 30
    expect(getRemainingPerDay({ remaining: 860 }, period)).toBe(33)
    expect(getRemainingPerDay({ remaining: 860 }, { daysInMonth: 30, elapsedDays: 25 })).toBe(143)
  })

  it('is the whole remainder on the last day', () => {
    expect(getRemainingPerDay({ remaining: 500 }, { daysInMonth: 30, elapsedDays: 30 })).toBe(500)
  })

  it('is hidden when over or exactly at the limit', () => {
    expect(getRemainingPerDay({ remaining: -340 }, period)).toBeNull()
    expect(getRemainingPerDay({ remaining: 0 }, period)).toBeNull()
  })

  it('is hidden when the period is unknown', () => {
    expect(getRemainingPerDay({ remaining: 100 }, {})).toBeNull()
    expect(getRemainingPerDay({ remaining: 100 })).toBeNull()
  })
})

describe('getBudgetBar', () => {
  it('fills spent over limit and caps it at the full bar', () => {
    expect(getBudgetBar({ spent: 750, limit: 1000 }, 40)).toEqual({ fill: 0.75, pace: 0.4 })
    expect(getBudgetBar({ spent: 3340, limit: 3000 }, 40).fill).toBe(1)
  })

  it('is empty without a usable limit and keeps the tick inside the bar', () => {
    expect(getBudgetBar({ spent: 10, limit: 0 }, 150)).toEqual({ fill: 0, pace: 1 })
    expect(getBudgetBar({ spent: 0, limit: 100 }, undefined)).toEqual({ fill: 0, pace: 0 })
  })
})

describe('formatBudgetValue', () => {
  it('reads spent / limit with the symbol', () => {
    expect(formatBudgetValue({ spent: 2140, limit: 3000, currency: 'THB' }, '฿')).toBe('2,140 / 3,000 ฿')
    expect(formatBudgetValue({ spent: 5, limit: 10, currency: 'THB' })).toBe('5 / 10')
  })
})

describe('describeBudgetRow', () => {
  const base = { limit: 3000, currency: 'THB' }

  it('is a dash without a limit', () => {
    expect(describeBudgetRow(null, period, money)).toBe('—')
  })

  it('shows the limit, what is left and the daily allowance', () => {
    expect(describeBudgetRow({ ...base, remaining: 860 }, period, money)).toBe(
      '3000 THB · left 860 THB · ~33 THB/day'
    )
  })

  it('shows how far over and no daily allowance', () => {
    expect(describeBudgetRow({ ...base, remaining: -340 }, period, money)).toBe('3000 THB · over by 340 THB')
  })

  it('asks to set the limit again after a currency change', () => {
    expect(describeBudgetRow({ ...base, currencyMismatch: true, state: null }, period, money)).toMatch(
      /another currency/
    )
  })
})

describe('a limit with nothing spent', () => {
  const untouched = { limit: 3000, spent: 0, remaining: 3000, currency: 'THB', state: 'on_track' }

  it('reads 0 / limit, with an empty bar', () => {
    expect(formatBudgetValue(untouched, '฿')).toBe('0 / 3,000 ฿')
    expect(getBudgetBar(untouched, 16.7).fill).toBe(0)
  })

  it('has the whole limit left and a daily allowance in the row', () => {
    expect(describeBudgetRow(untouched, period, money)).toBe('3000 THB · left 3000 THB · ~115 THB/day')
  })
})

describe('withBudgetOnlyCategories', () => {
  const food = { _id: 'c1', category: 'Food', icon: 'mdi-food', amount: 500, currency: 'THB', costs: [{}] }
  const budget = (id, name) => ({ category: { id, name, icon: `mdi-${name}` }, currency: 'THB', limit: 3000 })

  it('adds a limited category with no expenses, with nothing spent', () => {
    const rows = withBudgetOnlyCategories([food], [budget('c1', 'Food'), budget('c2', 'Taxi')])

    expect(rows).toEqual([
      food,
      { _id: 'c2', category: 'Taxi', icon: 'mdi-Taxi', amount: 0, currency: 'THB', costs: [] }
    ])
  })

  it('is every limited category at the start of a month', () => {
    expect(withBudgetOnlyCategories([], [budget('c1', 'Food'), budget('c2', 'Taxi')]).map((row) => row._id)).toEqual([
      'c1',
      'c2'
    ])
  })

  it('does not repeat a category that is already listed, and returns the same list when nothing is missing', () => {
    const expenses = [food]

    expect(withBudgetOnlyCategories(expenses, [budget('c1', 'Food')])).toBe(expenses)
    expect(withBudgetOnlyCategories(expenses, [])).toBe(expenses)
    expect(withBudgetOnlyCategories(expenses, [budget('c2', 'Taxi'), budget('c2', 'Taxi')])).toHaveLength(2)
  })

  it('ignores a budget without a category', () => {
    expect(withBudgetOnlyCategories([], [{ currency: 'THB' }])).toEqual([])
  })
})

describe('getLimitPrefill', () => {
  it('prefers the current limit', () => {
    expect(getLimitPrefill({ limit: 3000 }, 2500)).toBe('3000')
  })

  it('falls back to last month, rounded, then to nothing', () => {
    expect(getLimitPrefill(null, 2140.6)).toBe('2141')
    expect(getLimitPrefill(null, 0)).toBe('')
    expect(getLimitPrefill(null, undefined)).toBe('')
  })

  it('does not offer a limit in another currency', () => {
    expect(getLimitPrefill({ limit: 3000, currencyMismatch: true }, 1200)).toBe('1200')
  })
})

describe('parseLimit', () => {
  it('accepts positive numbers, with spaces or a comma', () => {
    expect(parseLimit('3000')).toBe(3000)
    expect(parseLimit(' 3 000,5 ')).toBe(3000.5)
  })

  it('rejects empty, zero, negative and text', () => {
    for (const value of ['', '   ', '0', '-5', 'abc', null, undefined, 'Infinity']) {
      expect(parseLimit(value)).toBeNull()
    }
  })
})
