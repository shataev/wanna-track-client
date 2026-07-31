const LOCALE = 'en-US'
const DEFAULT_FRACTION_DIGITS = 2

// Building a formatter is not cheap and amounts are rendered in lists,
// so keep one per currency
const formatters = new Map()

// Intl already knows how many minor units a currency has: none for VND, JPY
// and KRW, two for THB and USD, three for KWD. No table to maintain here.
const getFractionDigits = (currencyCode) => {
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency: currencyCode
    }).resolvedOptions().maximumFractionDigits
  } catch {
    // Not a well-formed ISO code — assume the common two decimals
    return DEFAULT_FRACTION_DIGITS
  }
}

const getFormatter = (currencyCode) => {
  const code = currencyCode || ''

  if (!formatters.has(code)) {
    formatters.set(
      code,
      new Intl.NumberFormat(LOCALE, {
        // Whole amounts stay clean ("5,000 ฿" rather than "5,000.00 ฿"),
        // while conversion tails get trimmed to the currency's precision
        minimumFractionDigits: 0,
        maximumFractionDigits: getFractionDigits(code)
      })
    )
  }

  return formatters.get(code)
}

/**
 * Formats an amount for display: thousands separators and as many decimals
 * as the currency actually has.
 *
 * @param {number|string} amount
 * @param {string} [currencyCode] - ISO 4217 code, e.g. 'VND'
 * @returns {string} e.g. '5,000,000' for VND, '1,234.56' for THB
 */
export const formatAmount = (amount, currencyCode) => {
  if (amount === null || amount === undefined || amount === '') {
    return ''
  }

  const value = Number(amount)

  if (!Number.isFinite(value)) {
    return ''
  }

  return getFormatter(currencyCode).format(value)
}

/**
 * Rate to convert one currency into another. Rates come from the API as
 * "1 base currency (usually USD) = X target currency", so the conversion
 * goes through the base.
 *
 * @param {string} fromCurrency
 * @param {string} toCurrency
 * @param {Object<string, number>} rates
 * @param {string} baseCurrency
 * @returns {number|null} null when either currency has no rate
 */
export const getConversionRate = (fromCurrency, toCurrency, rates, baseCurrency) => {
  if (fromCurrency === toCurrency) {
    return 1
  }

  const fromRate = fromCurrency === baseCurrency ? 1 : rates?.[fromCurrency]
  const toRate = toCurrency === baseCurrency ? 1 : rates?.[toCurrency]

  if (!fromRate || !toRate) {
    return null
  }

  return toRate / fromRate
}

/**
 * Rounds to the precision the currency actually has: dong to whole units,
 * baht to hundredths.
 *
 * @param {number} amount
 * @param {string} currencyCode
 * @returns {number}
 */
export const roundToCurrencyPrecision = (amount, currencyCode) => {
  const factor = 10 ** getFractionDigits(currencyCode)

  return Math.round(amount * factor) / factor
}
