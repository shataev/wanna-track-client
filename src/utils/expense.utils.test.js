import { describe, expect, it } from 'vitest'
import {
  buildCostRequestBody,
  buildCostUpdateBody,
  costToExpenseForm,
  getDeleteConfirmation,
  getCurrencyAfterFundChange,
  getExpenseErrorMessage,
  getFundDebit
} from '@/utils/expense.utils'

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

describe('costToExpenseForm', () => {
  const FUNDS = [{ _id: null, name: 'No fund' }, { _id: 'fund-thb', name: 'Cash', currency: 'THB' }]
  const cost = {
    _id: 'cost-1',
    amount: 1500,
    currency: 'JPY',
    rate: 0.24,
    fundAmount: 360,
    fund: { _id: 'fund-thb', name: 'Cash', currency: 'THB' },
    category: { _id: 'cat-food', name: 'Food', icon: 'mdi-food' },
    date: '2026-10-25T12:00:00.000Z',
    comment: 'Ramen',
    tags: ['japan-2026']
  }

  it('fills every field of the form from the cost', () => {
    expect(costToExpenseForm(cost, FUNDS)).toEqual({
      amount: 1500,
      currency: 'JPY',
      fundId: 'fund-thb',
      category: 'cat-food',
      date: new Date('2026-10-25T12:00:00.000Z'),
      comment: 'Ramen',
      tags: ['japan-2026']
    })
  })

  it('takes ids whether the API populates them or not', () => {
    const form = costToExpenseForm({ ...cost, fund: { id: 'fund-thb' }, category: 'cat-food' }, FUNDS)

    expect(form.fundId).toBe('fund-thb')
    expect(form.category).toBe('cat-food')
    expect(costToExpenseForm({ ...cost, fund: 'fund-thb' }, FUNDS).fundId).toBe('fund-thb')
  })

  it('reads a cost without a fund, or whose fund is gone, as "No fund"', () => {
    expect(costToExpenseForm({ ...cost, fund: null, fundAmount: null }, FUNDS).fundId).toBeNull()
    expect(costToExpenseForm({ ...cost, fund: { _id: 'deleted' } }, FUNDS).fundId).toBeNull()
  })

  it('leaves no undefined comment or tags for the inputs', () => {
    const form = costToExpenseForm({ ...cost, comment: undefined, tags: undefined }, FUNDS)

    expect(form.comment).toBe('')
    expect(form.tags).toEqual([])
  })
})

describe('buildCostUpdateBody', () => {
  const form = {
    amount: '1500',
    category: 'cat-food',
    date: new Date('2026-10-25T12:00:00Z'),
    comment: 'Ramen',
    fundId: 'fund-thb',
    currency: 'JPY',
    tags: ['Japan 2026']
  }

  it('sends every editable field with a numeric amount', () => {
    expect(buildCostUpdateBody(form)).toEqual({
      ...form,
      amount: 1500,
      tags: ['japan-2026']
    })
  })

  // Absent would leave the cost on its fund
  it('sends fundId null to take the expense off its fund', () => {
    const body = buildCostUpdateBody({ ...form, fundId: null })

    expect(body).toHaveProperty('fundId')
    expect(body.fundId).toBeNull()
  })

  it('sends an empty tag list when every chip was removed', () => {
    expect(buildCostUpdateBody({ ...form, tags: [] }).tags).toEqual([])
  })

  it('never sends a rate or fundAmount', () => {
    const body = buildCostUpdateBody({ ...form, rate: 0.24, fundAmount: 360 })

    expect(body).not.toHaveProperty('rate')
    expect(body).not.toHaveProperty('fundAmount')
  })
})

describe('getDeleteConfirmation', () => {
  const formatMoney = (amount, currency) => `${amount} ${currency}`

  it('names what goes back to the fund, in the fund currency', () => {
    // 1500 JPY paid from a THB fund debited 360 THB
    const cost = { amount: 1500, currency: 'JPY', fundAmount: 360, fund: { name: 'Cash', currency: 'THB' } }

    expect(getDeleteConfirmation(cost, formatMoney)).toBe('Delete this expense? 360 THB will go back to Cash.')
  })

  it('falls back to the amount for costs older than fundAmount', () => {
    const cost = { amount: 200, currency: 'THB', fundAmount: undefined, fund: { name: 'Cash', currency: 'THB' } }

    expect(getDeleteConfirmation(cost, formatMoney)).toBe('Delete this expense? 200 THB will go back to Cash.')
  })

  it('only asks when there is no fund, or the fund was deleted', () => {
    expect(getDeleteConfirmation({ amount: 200, fundAmount: null }, formatMoney)).toBe('Delete this expense?')
    expect(getDeleteConfirmation({ amount: 200, fund: null, fundAmount: null }, formatMoney)).toBe(
      'Delete this expense?'
    )
  })
})

describe('getExpenseErrorMessage', () => {
  const apiError = (error, status = 400) => ({ response: { status, data: { error } } })

  it('explains the refusals the API gives a reason for', () => {
    expect(getExpenseErrorMessage(apiError('Insufficient funds'))).toMatch(/^Insufficient funds/)
    expect(getExpenseErrorMessage(apiError('Fund not found', 404))).toMatch(/fund was not found/)
    expect(getExpenseErrorMessage(apiError('Cost not found', 404))).toBe('This expense no longer exists.')
    expect(
      getExpenseErrorMessage(apiError('Exchange rate not found for currency: XXX'), { currency: 'XXX' })
    ).toBe('No exchange rate for XXX. Please choose another currency.')
  })

  it('names the action for anything else', () => {
    expect(getExpenseErrorMessage(apiError(undefined, 500), { action: 'creating' })).toBe(
      'An error occurred while creating the expense. Please try again.'
    )
    expect(getExpenseErrorMessage(apiError('Category not found', 404))).toBe(
      'An error occurred while saving the expense. Please try again.'
    )
  })

  it('tells a network failure apart', () => {
    expect(getExpenseErrorMessage(new Error('Network Error'))).toMatch(/^Network error/)
  })
})

describe('getCurrencyAfterFundChange', () => {
  it('starts a new expense again from the fund currency, else the default', () => {
    expect(
      getCurrencyAfterFundChange({ isEditMode: false, currency: 'JPY', fundCurrency: 'THB', userCurrency: 'USD' })
    ).toBe('THB')
    expect(
      getCurrencyAfterFundChange({ isEditMode: false, currency: 'JPY', fundCurrency: undefined, userCurrency: 'USD' })
    ).toBe('USD')
  })

  // 1500 JPY moved from Cash to Card must stay 1500 JPY, not become 1500 THB
  it('keeps what an edited expense was spent in when its fund changes', () => {
    expect(
      getCurrencyAfterFundChange({ isEditMode: true, currency: 'JPY', fundCurrency: 'THB', userCurrency: 'THB' })
    ).toBe('JPY')
    expect(
      getCurrencyAfterFundChange({ isEditMode: true, currency: 'JPY', fundCurrency: undefined, userCurrency: 'THB' })
    ).toBe('JPY')
  })

  it('moving the fund only sends the same amount and currency, and previews the new debit', () => {
    const currency = getCurrencyAfterFundChange({
      isEditMode: true,
      currency: 'JPY',
      fundCurrency: 'THB',
      userCurrency: 'THB'
    })
    const body = buildCostUpdateBody({
      amount: 1500,
      category: 'cat-food',
      date: new Date('2026-10-25T12:00:00Z'),
      comment: 'Ramen',
      fundId: 'fund-card',
      currency,
      tags: []
    })

    expect(body).toMatchObject({ amount: 1500, currency: 'JPY', fundId: 'fund-card' })
    expect(getFundDebit({ amount: 1500, currency, fundCurrency: 'THB', rates: RATES })).toEqual({ fundAmount: 360 })
  })

  it('falls back to the fund currency when an edited expense has none', () => {
    expect(
      getCurrencyAfterFundChange({ isEditMode: true, currency: null, fundCurrency: 'THB', userCurrency: 'USD' })
    ).toBe('THB')
  })
})
