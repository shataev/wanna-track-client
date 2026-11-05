import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getBangkokMonthRange,
  getBangkokMonthRangeFor,
  getCurrentMonthRange,
  getPreviousBangkokMonthKey,
  isCurrentBangkokMonth
} from '@/utils/date.utils'

const iso = (range) => range.map((date) => date.toISOString())

describe('getBangkokMonthRange', () => {
  it('starts and ends the month at Bangkok midnight, seven hours before UTC', () => {
    expect(iso(getBangkokMonthRange(new Date('2026-11-05T10:00:00Z')))).toEqual([
      '2026-10-31T17:00:00.000Z',
      '2026-11-30T16:59:59.999Z'
    ])
  })

  it('puts 2026-10-31T18:00Z in November: it is already 01:00 on the 1st in Bangkok', () => {
    expect(iso(getBangkokMonthRange(new Date('2026-10-31T18:00:00Z')))[0]).toBe('2026-10-31T17:00:00.000Z')
    // one minute earlier is still October
    expect(iso(getBangkokMonthRange(new Date('2026-10-31T16:59:00Z')))[0]).toBe('2026-09-30T17:00:00.000Z')
  })

  it('handles the last instant of a month and a leap February', () => {
    expect(iso(getBangkokMonthRange(new Date('2026-11-30T16:59:59.999Z')))[1]).toBe('2026-11-30T16:59:59.999Z')
    expect(iso(getBangkokMonthRange(new Date('2028-02-10T00:00:00Z')))).toEqual([
      '2028-01-31T17:00:00.000Z',
      '2028-02-29T16:59:59.999Z'
    ])
  })

  it('rolls over the year', () => {
    expect(iso(getBangkokMonthRange(new Date('2026-12-31T18:00:00Z')))).toEqual([
      '2026-12-31T17:00:00.000Z',
      '2027-01-31T16:59:59.999Z'
    ])
  })
})

describe('getBangkokMonthRangeFor', () => {
  it('answers a given month, 0-based', () => {
    expect(iso(getBangkokMonthRangeFor(2026, 9))).toEqual(['2026-09-30T17:00:00.000Z', '2026-10-31T16:59:59.999Z'])
  })
})

describe('getCurrentMonthRange', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('is the Bangkok month of the clock, whatever day the browser thinks it is', () => {
    vi.useFakeTimers()
    // 20:00 on Oct 31 in Los Angeles is already Nov 1, 10:00 in Bangkok
    vi.setSystemTime(new Date('2026-11-01T03:00:00Z'))

    expect(iso(getCurrentMonthRange())).toEqual(['2026-10-31T17:00:00.000Z', '2026-11-30T16:59:59.999Z'])
  })
})

describe('isCurrentBangkokMonth', () => {
  const now = new Date('2026-11-05T10:00:00Z')

  it('is true for exactly the current Bangkok month', () => {
    expect(isCurrentBangkokMonth(getBangkokMonthRange(now), now)).toBe(true)
    expect(isCurrentBangkokMonth(iso(getBangkokMonthRange(now)), now)).toBe(true)
  })

  it('is false for another month, a part of it or a browser-local month', () => {
    expect(isCurrentBangkokMonth(getBangkokMonthRange(new Date('2026-10-05T10:00:00Z')), now)).toBe(false)
    expect(isCurrentBangkokMonth([new Date('2026-10-31T17:00:00.000Z'), new Date('2026-11-15T00:00:00Z')], now)).toBe(
      false
    )
    expect(isCurrentBangkokMonth([new Date('2026-11-01T00:00:00Z'), new Date('2026-11-30T23:59:59.999Z')], now)).toBe(
      false
    )
    expect(isCurrentBangkokMonth(null, now)).toBe(false)
  })
})

describe('getPreviousBangkokMonthKey', () => {
  it('is the month before the Bangkok one, across a year', () => {
    expect(getPreviousBangkokMonthKey(new Date('2026-11-05T10:00:00Z'))).toBe('2026-10')
    expect(getPreviousBangkokMonthKey(new Date('2027-01-02T10:00:00Z'))).toBe('2026-12')
    // 18:00Z on Oct 31 is November in Bangkok
    expect(getPreviousBangkokMonthKey(new Date('2026-10-31T18:00:00Z'))).toBe('2026-10')
  })
})
