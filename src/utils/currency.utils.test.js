import { describe, expect, it } from 'vitest'
import { orderCurrencies } from '@/utils/currency.utils'

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'VND', name: 'Vietnamese Dong' }
]

const codes = (list) => list.map(({ code }) => code)

describe('orderCurrencies', () => {
  it('puts the given codes first, in their order, and the rest by code', () => {
    const { preferred, others } = orderCurrencies(CURRENCIES, ['THB', 'JPY'])

    expect(codes(preferred)).toEqual(['THB', 'JPY'])
    expect(codes(others)).toEqual(['AED', 'USD', 'VND'])
  })

  it('lists a currency once even when several funds share it', () => {
    const { preferred, others } = orderCurrencies(CURRENCIES, ['THB', 'THB', 'JPY', 'THB'])

    expect(codes(preferred)).toEqual(['THB', 'JPY'])
    expect(codes(others)).toEqual(['AED', 'USD', 'VND'])
  })

  it('ignores codes that are missing or not in the list', () => {
    const { preferred } = orderCurrencies(CURRENCIES, [null, undefined, 'XXX', 'VND'])

    expect(codes(preferred)).toEqual(['VND'])
  })

  it('does not reorder the list it was given', () => {
    orderCurrencies(CURRENCIES, ['THB'])

    expect(codes(CURRENCIES)).toEqual(['USD', 'JPY', 'AED', 'THB', 'VND'])
  })
})
