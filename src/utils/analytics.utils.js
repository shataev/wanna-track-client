import { formatAmount } from '@/utils/currency.utils'
import { DELTA_COLORS } from '@/constants/colors.constants'

const MINUS = '−'

/**
 * Change of a total against the previous period.
 *
 * @param {number} current
 * @param {number} previous
 * @returns {{diff: number, percent: number|null, direction: 'up'|'down'|'flat'}}
 *   percent is null when the previous total is zero: growth from nothing has no percentage
 */
export const getChange = (current, previous) => {
  const currentValue = Number(current) || 0
  const previousValue = Number(previous) || 0
  const diff = currentValue - previousValue

  return {
    diff,
    percent: previousValue ? (diff / previousValue) * 100 : null,
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'
  }
}

/**
 * Whole percent without a sign; one decimal below 10% so that small moves
 * do not all read as "0%" or "1%".
 *
 * @param {number|null} percent
 * @returns {string} e.g. '12%', '2.5%', '' for null
 */
export const formatPercent = (percent) => {
  if (percent === null || percent === undefined || !Number.isFinite(percent)) {
    return ''
  }

  const value = Math.abs(percent)
  const rounded = value < 10 ? Math.round(value * 10) / 10 : Math.round(value)

  return `${rounded}%`
}

/**
 * Short delta label for a category or a total: '▲ 12%', '▼ 5%', '▲ new',
 * '▼ 100%' for a category gone this period, '—' for no change.
 *
 * @param {number} current
 * @param {number} previous
 * @returns {string}
 */
export const formatDelta = (current, previous) => {
  const { percent, direction } = getChange(current, previous)

  if (direction === 'flat') {
    return '—'
  }

  const arrow = direction === 'up' ? '▲' : '▼'

  return `${arrow} ${percent === null ? 'new' : formatPercent(percent)}`
}

/**
 * Amount with an explicit sign, for the absolute change.
 *
 * @param {number} amount
 * @param {string} currencyCode
 * @returns {string} e.g. '+1,200', '−300.5', '0'
 */
export const formatSignedAmount = (amount, currencyCode) => {
  const value = Number(amount) || 0
  const formatted = formatAmount(Math.abs(value), currencyCode)

  // Rounding to the currency's precision may leave nothing to sign
  if (formatted === formatAmount(0, currencyCode)) {
    return formatted
  }

  return `${value > 0 ? '+' : MINUS}${formatted}`
}

/**
 * Colour of a delta. These are expenses: spending more is the bad direction.
 *
 * @param {number} current
 * @param {number} previous
 * @returns {string}
 */
export const getDeltaColor = (current, previous) =>
  DELTA_COLORS[getChange(current, previous).direction]

/**
 * Local start and end of a month given as 'YYYY-MM', in the shape DateFilter
 * produces for its month picker.
 *
 * @param {string} month
 * @returns {[Date, Date]|null}
 */
export const getMonthRange = (month) => {
  const match = /^(\d{4})-(\d{2})$/.exec(month || '')

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1

  if (monthIndex < 0 || monthIndex > 11) {
    return null
  }

  return [new Date(year, monthIndex), new Date(year, monthIndex + 1, 1, 0, 0, 0, -1)]
}

/**
 * @param {string} month - 'YYYY-MM'
 * @returns {string} e.g. 'Oct 26'
 */
export const formatMonthLabel = (month) => {
  const range = getMonthRange(month)

  if (!range) {
    return month || ''
  }

  return range[0].toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export const OTHER_CATEGORY_ID = 'other'

/**
 * Stacked-bar series for the monthly trend: the categories with the largest
 * total over all the months, then everything else as one "Other" series.
 *
 * @param {Array<{month: string, total: number, categories: Array<{id, name, icon, total}>}>} months
 * @param {number} [limit]
 * @returns {Array<{id: string, name: string, data: number[]}>} largest first, "Other" last
 *   and only when it has something in it
 */
export const buildTrendSeries = (months = [], limit = 6) => {
  const totals = new Map()

  for (const { categories = [] } of months) {
    for (const category of categories) {
      const entry = totals.get(category.id) ?? { id: category.id, name: category.name, total: 0 }

      entry.total += category.total
      totals.set(category.id, entry)
    }
  }

  const top = [...totals.values()].sort((a, b) => b.total - a.total).slice(0, limit)
  const topIds = new Set(top.map(({ id }) => id))

  const series = top.map(({ id, name }) => ({
    id,
    name,
    data: months.map(
      ({ categories = [] }) => categories.find((category) => category.id === id)?.total ?? 0
    )
  }))

  const other = months.map(({ categories = [] }) =>
    categories.filter(({ id }) => !topIds.has(id)).reduce((sum, { total }) => sum + total, 0)
  )

  if (other.some((total) => total > 0)) {
    series.push({ id: OTHER_CATEGORY_ID, name: 'Other', data: other })
  }

  return series
}

const PERIOD_NAMES = ['day', 'week', 'month', 'year', 'calendar']

/**
 * Route query that carries a DateFilter value to another page.
 *
 * @param {{periodName: string, dates: Date[]}} filter
 * @returns {{period: string, from: string, to: string}}
 */
export const toPeriodQuery = ({ periodName, dates }) => ({
  period: periodName,
  from: new Date(dates[0]).toISOString(),
  to: new Date(dates[1]).toISOString()
})

/**
 * The DateFilter value back from a route query.
 *
 * @param {Object} query
 * @returns {{periodName: string, dates: [Date, Date]}|null} null when the query has no valid period
 */
export const fromPeriodQuery = (query = {}) => {
  const { period, from, to } = query

  if (!PERIOD_NAMES.includes(period) || !from || !to) {
    return null
  }

  const dateFrom = new Date(from)
  const dateTo = new Date(to)

  if (Number.isNaN(dateFrom.getTime()) || Number.isNaN(dateTo.getTime()) || dateFrom > dateTo) {
    return null
  }

  return { periodName: period, dates: [dateFrom, dateTo] }
}
