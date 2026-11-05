import { BUDGET_COLORS } from '@/constants/colors.constants'
import { formatAmount } from '@/utils/currency.utils'

/**
 * @param {string|null|undefined} state - 'on_track' | 'ahead' | 'over' from the API
 * @returns {{color: string, backgroundColor: string}|null} null for no state (nothing to colour)
 */
export const getBudgetColors = (state) => BUDGET_COLORS[state] ?? null

/**
 * A budget the page can draw: it has a limit and a state. One set in another currency
 * (currencyMismatch) comes back without a state and is shown as a prompt instead.
 */
export const hasBudgetState = (budget) => Boolean(budget && budget.state && getBudgetColors(budget.state))

/**
 * What the owner can still spend per day: the remainder over the days left in the
 * month, today included. Nothing once the limit is reached.
 *
 * @param {{remaining: number}} budget
 * @param {{daysInMonth: number, elapsedDays: number}} period - elapsedDays counts today
 * @returns {number|null} whole units of the currency; null when over, or when there are no days left
 */
export const getRemainingPerDay = (budget, { daysInMonth, elapsedDays } = {}) => {
  const remaining = Number(budget?.remaining)
  const daysLeft = Number(daysInMonth) - Number(elapsedDays) + 1

  if (!Number.isFinite(remaining) || !Number.isFinite(daysLeft) || remaining <= 0 || daysLeft < 1) {
    return null
  }

  return Math.round(remaining / daysLeft)
}

/**
 * Fill of a category bar: how much of the limit is spent, capped at the full bar.
 * Pace is where the month stands, 0..1, for the tick.
 *
 * @returns {{fill: number, pace: number}}
 */
export const getBudgetBar = (budget, pacePercent) => {
  const spent = Number(budget?.spent)
  const limit = Number(budget?.limit)
  const fill = limit > 0 && Number.isFinite(spent) ? Math.min(1, Math.max(0, spent / limit)) : 0
  const pace = Math.min(1, Math.max(0, Number(pacePercent) / 100)) || 0

  return { fill, pace }
}

/**
 * Inline styles of the limit strip along the bottom of a category button: the fill in
 * the state colour, spent/limit of the strip wide and never wider than it, and the pace tick.
 *
 * @param {{fill: number, pace: number, color: string}} bar
 * @returns {{fill: {width: string, backgroundColor: string}, tick: {left: string}}}
 */
export const getLimitStripStyles = ({ fill, pace, color }) => {
  const share = (value) => Math.min(1, Math.max(0, Number(value) || 0)) * 100

  return {
    fill: { width: `${share(fill)}%`, backgroundColor: color },
    tick: { left: `${share(pace)}%` }
  }
}

/**
 * The value of a category button: `2 140 / 3 000 ฿`.
 */
export const formatBudgetValue = (budget, symbol = '') => {
  const text = `${formatAmount(budget.spent, budget.currency)} / ${formatAmount(budget.limit, budget.currency)}`

  return symbol ? `${text} ${symbol}` : text
}

/**
 * The text of the "Monthly limit" row, after the label.
 *
 * @param {Object|null} budget - this category's item from GET /api/budgets, or null when it has none
 * @param {{daysInMonth: number, elapsedDays: number}} period
 * @param {(amount: number, currency: string) => string} formatMoney - amount with its symbol
 */
export const describeBudgetRow = (budget, period, formatMoney) => {
  if (!budget) {
    return '—'
  }

  if (budget.currencyMismatch) {
    return 'set in another currency, set it again'
  }

  const parts = [formatMoney(budget.limit, budget.currency)]

  if (budget.remaining < 0) {
    parts.push(`over by ${formatMoney(-budget.remaining, budget.currency)}`)
  } else {
    parts.push(`left ${formatMoney(budget.remaining, budget.currency)}`)

    const perDay = getRemainingPerDay(budget, period)

    if (perDay !== null) {
      // One unbreakable piece: "~33 ฿/day" must not wrap between the amount and the symbol
    parts.push(`~${formatMoney(perDay, budget.currency)}/day`.replace(/ /g, '\u00A0'))
    }
  }

  return parts.join(' · ')
}

/**
 * The category rows of the Expenses page: the categories with expenses, then every
 * category that has a limit but no expense in the period, with nothing spent. At the
 * start of a month that is every limited category, and the limit is what the owner
 * wants to see then.
 *
 * @param {Array<{_id: string}>} expenses - the page's categories
 * @param {Array<{category: {id, name, icon}, currency: string}>} budgets
 * @returns {Array} `expenses` itself when there is nothing to add
 */
export const withBudgetOnlyCategories = (expenses = [], budgets = []) => {
  const shown = new Set(expenses.map(({ _id }) => _id))
  const missing = []

  for (const budget of budgets) {
    const category = budget?.category

    if (category?.id && !shown.has(category.id)) {
      shown.add(category.id)
      missing.push({
        _id: category.id,
        category: category.name,
        icon: category.icon,
        amount: 0,
        currency: budget.currency,
        costs: []
      })
    }
  }

  return missing.length ? [...expenses, ...missing] : expenses
}

/**
 * Starting value for the limit field: the current limit, else what the category
 * took last month, else empty.
 *
 * @param {Object|null} budget
 * @param {number|null|undefined} lastMonthTotal
 * @returns {string}
 */
export const getLimitPrefill = (budget, lastMonthTotal) => {
  if (budget && !budget.currencyMismatch && budget.limit > 0) {
    return String(budget.limit)
  }

  const total = Number(lastMonthTotal)

  return Number.isFinite(total) && total > 0 ? String(Math.round(total)) : ''
}

/**
 * @param {string|number} input
 * @returns {number|null} a positive finite amount, else null
 */
export const parseLimit = (input) => {
  const text = String(input ?? '').trim().replace(/\s/g, '').replace(',', '.')

  if (!text) {
    return null
  }

  const value = Number(text)

  return Number.isFinite(value) && value > 0 ? value : null
}
