import { describe, expect, it } from 'vitest'
import { buildCostRequestBody, getFundDebit } from '@/utils/expense.utils'

// 1 USD = X
const RATES = { base: 'USD', rates: { THB: 36, JPY: 150, VND: 25000 } }

describe('buildCostRequestBody', () => {
  const form = {
    amount: '1500',
    category: 'food',
    date: new Date('2026-10-25T12:00:00Z'),
    comment: 'Ramen',
    fundId: 'fund-1',
    currency: 'JPY'
  }

  it('sends the currency and the normalised tags', () => {
    expect(buildCostRequestBody({ ...form, tags: ['Japan 2026', 'japan-2026'] })).toEqual({
      ...form,
      tags: ['japan-2026']
    })
  })

  // An absent list would make the API put the active tag back
  it('sends an empty list when every chip was removed', () => {
    const body = buildCostRequestBody({ ...form, tags: [] })

    expect(body).toHaveProperty('tags')
    expect(body.tags).toEqual([])
  })

  it('sends an empty list when there were no chips at all', () => {
    expect(buildCostRequestBody({ ...form, tags: undefined }).tags).toEqual([])
  })

  it('never sends a rate', () => {
    expect(buildCostRequestBody({ ...form, rate: 0.24, tags: [] })).not.toHaveProperty('rate')
  })
})

describe('getFundDebit', () => {
  it('converts into the fund currency through the base', () => {
    // 1500 JPY = 10 USD = 360 THB
    expect(getFundDebit({ amount: 1500, currency: 'JPY', fundCurrency: 'THB', rates: RATES })).toEqual({
      fundAmount: 360
    })
  })

  it('rounds to the fund currency precision', () => {
    // 1234 JPY = 8.2266.. USD = 296.16 THB
    expect(getFundDebit({ amount: '1234', currency: 'JPY', fundCurrency: 'THB', rates: RATES })).toEqual({
      fundAmount: 296.16
    })
    // 100 THB = 2.777.. USD = 416.67 JPY, and yen have no decimals
    expect(getFundDebit({ amount: 100, currency: 'THB', fundCurrency: 'JPY', rates: RATES })).toEqual({
      fundAmount: 417
    })
    expect(getFundDebit({ amount: 1, currency: 'THB', fundCurrency: 'VND', rates: RATES })).toEqual({
      fundAmount: 694
    })
  })

  it('has nothing to show in the same currency, without a fund or an amount', () => {
    expect(getFundDebit({ amount: 100, currency: 'THB', fundCurrency: 'THB', rates: RATES })).toBeNull()
    expect(getFundDebit({ amount: 100, currency: 'JPY', fundCurrency: null, rates: RATES })).toBeNull()
    expect(getFundDebit({ amount: '', currency: 'JPY', fundCurrency: 'THB', rates: RATES })).toBeNull()
  })

  it('reports a missing rate instead of guessing', () => {
    expect(getFundDebit({ amount: 100, currency: 'XXX', fundCurrency: 'THB', rates: RATES })).toEqual({
      fundAmount: null
    })
    expect(getFundDebit({ amount: 100, currency: 'JPY', fundCurrency: 'THB', rates: null })).toEqual({
      fundAmount: null
    })
  })
})
