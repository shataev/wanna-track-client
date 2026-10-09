import { describe, expect, it } from 'vitest'
import {
  buildTrendSeries,
  formatDelta,
  formatMonthLabel,
  formatPercent,
  formatSignedAmount,
  fromPeriodQuery,
  getChange,
  getDeltaColor,
  getMonthRange,
  toPeriodQuery
} from '@/utils/analytics.utils'
import { DELTA_COLORS } from '@/constants/colors.constants'

describe('getChange', () => {
  it('answers the difference and its share of the previous total', () => {
    expect(getChange(1500, 1000)).toEqual({ diff: 500, percent: 50, direction: 'up' })
    expect(getChange(750, 1000)).toEqual({ diff: -250, percent: -25, direction: 'down' })
  })

  it('has no percentage when there was nothing before', () => {
    expect(getChange(300, 0)).toEqual({ diff: 300, percent: null, direction: 'up' })
  })

  it('is flat when nothing changed, including two empty periods', () => {
    expect(getChange(0, 0)).toEqual({ diff: 0, percent: null, direction: 'flat' })
    expect(getChange(100, 100).direction).toBe('flat')
  })

  it('treats a missing total as zero', () => {
    expect(getChange(undefined, 200)).toEqual({ diff: -200, percent: -100, direction: 'down' })
  })
})

describe('formatPercent', () => {
  it('drops the sign and rounds to whole percent from 10% up', () => {
    expect(formatPercent(12.4)).toBe('12%')
    expect(formatPercent(-37.6)).toBe('38%')
  })

  it('keeps one decimal below 10%', () => {
    expect(formatPercent(2.54)).toBe('2.5%')
    expect(formatPercent(-0.04)).toBe('0%')
  })

  it('is empty without a percentage', () => {
    expect(formatPercent(null)).toBe('')
    expect(formatPercent(Infinity)).toBe('')
  })
})

describe('formatDelta', () => {
  it('points up for more spending and down for less', () => {
    expect(formatDelta(120, 100)).toBe('▲ 20%')
    expect(formatDelta(80, 100)).toBe('▼ 20%')
  })

  it('marks a category that had nothing in the previous period as new', () => {
    expect(formatDelta(50, 0)).toBe('▲ new')
  })

  it('shows a category gone this period as down 100%', () => {
    expect(formatDelta(0, 50)).toBe('▼ 100%')
  })

  it('shows no arrow when nothing changed', () => {
    expect(formatDelta(100, 100)).toBe('—')
    expect(formatDelta(0, 0)).toBe('—')
  })
})

describe('formatSignedAmount', () => {
  it('signs the change with plus or a real minus', () => {
    expect(formatSignedAmount(1200, 'THB')).toBe('+1,200')
    expect(formatSignedAmount(-300.5, 'THB')).toBe('−300.5')
  })

  it('rounds to the currency first and leaves an unsigned zero', () => {
    expect(formatSignedAmount(-0.4, 'VND')).toBe('0')
    expect(formatSignedAmount(0, 'THB')).toBe('0')
  })
})

describe('getDeltaColor', () => {
  it('colours more spending as bad and less as good', () => {
    expect(getDeltaColor(120, 100)).toBe(DELTA_COLORS.up)
    expect(getDeltaColor(80, 100)).toBe(DELTA_COLORS.down)
    expect(getDeltaColor(100, 100)).toBe(DELTA_COLORS.flat)
    expect(DELTA_COLORS.up).not.toBe(DELTA_COLORS.down)
  })
})

describe('getMonthRange', () => {
  it('answers the local first and last moment of the month', () => {
    const [from, to] = getMonthRange('2026-02')

    expect(from).toEqual(new Date(2026, 1, 1))
    expect(to).toEqual(new Date(2026, 1, 28, 23, 59, 59, 999))
  })

  it('handles December into the next year', () => {
    const [, to] = getMonthRange('2025-12')

    expect(to).toEqual(new Date(2025, 11, 31, 23, 59, 59, 999))
  })

  it('answers null for anything that is not a month', () => {
    expect(getMonthRange('2026-13')).toBeNull()
    expect(getMonthRange('2026-1')).toBeNull()
    expect(getMonthRange(undefined)).toBeNull()
  })
})

describe('formatMonthLabel', () => {
  it('is a short month with a two-digit year', () => {
    expect(formatMonthLabel('2026-10')).toBe('Oct 26')
  })
})

describe('buildTrendSeries', () => {
  const category = (id, total) => ({ id, name: `Category ${id}`, icon: 'mdi-cart', total })

  it('keeps the largest categories over all months and folds the rest into Other', () => {
    const months = [
      { month: '2026-09', total: 0, categories: [] },
      {
        month: '2026-10',
        total: 0,
        categories: [category('a', 10), category('b', 70), category('c', 5), category('d', 1)]
      },
      { month: '2026-11', total: 0, categories: [category('a', 50), category('c', 20)] }
    ]

    const series = buildTrendSeries(months, 2)

    expect(series.map(({ id }) => id)).toEqual(['b', 'a', 'other'])
    expect(series[0]).toEqual({ id: 'b', name: 'Category b', data: [0, 70, 0] })
    expect(series[1].data).toEqual([0, 10, 50])
    expect(series[2]).toEqual({ id: 'other', name: 'Other', data: [0, 6, 20] })
  })

  it('stacks every month up to the sum of its categories', () => {
    const months = [
      {
        month: '2026-10',
        total: 0,
        categories: [category('a', 3), category('b', 4), category('c', 5)]
      }
    ]

    const stacked = buildTrendSeries(months, 1).reduce((sum, { data }) => sum + data[0], 0)

    expect(stacked).toBe(12)
  })

  it('has no Other when everything fits', () => {
    const months = [{ month: '2026-10', total: 0, categories: [category('a', 3)] }]

    expect(buildTrendSeries(months).map(({ id }) => id)).toEqual(['a'])
  })

  it('answers no series for months without expenses', () => {
    expect(buildTrendSeries([{ month: '2026-10', total: 0, categories: [] }])).toEqual([])
    expect(buildTrendSeries()).toEqual([])
  })
})

describe('period query', () => {
  it('carries a DateFilter value through the route and back', () => {
    const filter = { periodName: 'month', dates: getMonthRange('2026-09') }

    expect(fromPeriodQuery(toPeriodQuery(filter))).toEqual(filter)
  })

  it('answers null for a missing or broken period', () => {
    expect(fromPeriodQuery({})).toBeNull()
    expect(fromPeriodQuery({ period: 'decade', from: '2026-01-01', to: '2026-02-01' })).toBeNull()
    expect(fromPeriodQuery({ period: 'month', from: 'yesterday', to: '2026-02-01' })).toBeNull()
    expect(fromPeriodQuery({ period: 'month', from: '2026-03-01', to: '2026-02-01' })).toBeNull()
  })
})
