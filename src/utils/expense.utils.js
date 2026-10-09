import { getConversionRate, roundToCurrencyPrecision } from '@/utils/currency.utils'
import { normalizeTags } from '@/utils/tags.utils'

/**
 * Body of POST /api/cost. `tags` is always sent, even empty: an absent list
 * makes the API apply the active tag, so a chip the user removed would come back.
 * `rate` is never sent — the API computes it.
 */
export const buildCostRequestBody = ({ amount, category, date, comment, fundId, currency, tags }) => ({
  amount,
  category,
  date,
  comment,
  fundId,
  currency,
  tags: normalizeTags(tags)
})

/**
 * What the fund will be debited when the expense is in another currency,
 * using the same conversion as the API.
 *
 * @returns {null|{fundAmount: number|null}} null when there is nothing to
 *   convert; fundAmount null when there is no rate for the pair
 */
export const getFundDebit = ({ amount, currency, fundCurrency, rates }) => {
  const value = Number(amount)

  if (!fundCurrency || !currency || currency === fundCurrency || !(value > 0)) {
    return null
  }

  const rate = getConversionRate(currency, fundCurrency, rates?.rates, rates?.base)

  if (!rate) {
    return { fundAmount: null }
  }

  return { fundAmount: roundToCurrencyPrecision(value * rate, fundCurrency) }
}
