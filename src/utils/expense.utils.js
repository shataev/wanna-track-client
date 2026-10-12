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

// An id from a populated document ({ _id } or { id }) or the id itself
const toId = (value) => {
  if (value && typeof value === 'object') {
    return value._id ?? value.id ?? null
  }

  return value || null
}

/**
 * The expense form filled from GET /api/cost/:id. The fund is kept only when it is
 * still one of the user's funds; a deleted fund reads as "No fund".
 *
 * @param {Object} cost
 * @param {Array<{_id: string|null}>} funds - the fund list of the form
 */
export const costToExpenseForm = (cost, funds = []) => {
  const fundId = toId(cost.fund)

  return {
    amount: cost.amount,
    currency: cost.currency || null,
    fundId: funds.some((fund) => fund._id === fundId) ? fundId : null,
    category: toId(cost.category),
    date: new Date(cost.date),
    comment: cost.comment || '',
    tags: normalizeTags(cost.tags || [])
  }
}

/**
 * Body of PATCH /api/cost/:id: every editable field, so the API compares each with
 * the stored cost. `fundId` null moves the expense off its fund; the amount is a number,
 * so an untouched amount compares equal.
 */
export const buildCostUpdateBody = (form) => ({
  ...buildCostRequestBody(form),
  amount: Number(form.amount),
  fundId: form.fundId || null
})

/**
 * The question before deleting. A cost with a fund was debited `fundAmount` in the
 * fund's currency (old costs: `amount`), and that is what goes back.
 *
 * @param {Object} cost - a cost from GET /api/costs
 * @param {function(number, string): string} formatMoney
 */
export const getDeleteConfirmation = (cost, formatMoney) => {
  const question = 'Delete this expense?'

  if (!cost.fund?.name) {
    return question
  }

  const refund = cost.fundAmount ?? cost.amount

  return `${question} ${formatMoney(refund, cost.fund.currency)} will go back to ${cost.fund.name}.`
}

/**
 * What the expense form says when the API refuses.
 *
 * @param {Object} error - from axios
 * @param {{currency?: string, action?: string}} context - action as in "while <action> the expense"
 */
export const getExpenseErrorMessage = (error, { currency, action = 'saving' } = {}) => {
  if (!error?.response) {
    return 'Network error. Please check your connection and try again.'
  }

  const errorMessage = error.response.data?.error

  if (errorMessage === 'Fund not found') {
    return 'Selected fund was not found. Please try again.'
  }

  if (errorMessage === 'Insufficient funds') {
    return 'Insufficient funds in the selected account. Please choose another fund or reduce the amount.'
  }

  if (errorMessage?.startsWith('Exchange rate not found')) {
    return `No exchange rate for ${currency}. Please choose another currency.`
  }

  if (errorMessage === 'Cost not found') {
    return 'This expense no longer exists.'
  }

  return `An error occurred while ${action} the expense. Please try again.`
}
