/**
 * Only the funds that are really archived. A deployed API that does not know
 * `?archived=true` answers with the active funds; none of them carries `archivedAt`,
 * so the Archive section stays empty instead of listing live funds as archived.
 *
 * @param {{funds?: Array<{archivedAt?: string|null}>}|null} response
 */
export const pickArchivedFunds = (response) =>
  (response?.funds ?? []).filter((fund) => Boolean(fund.archivedAt))

/** The funds a user can still use: archived ones never go into a picker. */
export const pickActiveFunds = (funds = []) => funds.filter((fund) => !fund.archivedAt)

/**
 * The fund picker of the expense form. An expense that sits on an archived fund keeps
 * showing that fund, otherwise saving the form would quietly move it to "No fund".
 *
 * @param {Array<{_id: string|null}>} funds - active funds, "No fund" included
 * @param {Object|null} cost - from GET /api/cost/:id
 */
export const withCostFund = (funds, cost) => {
  const fund = cost?.fund

  if (!fund || typeof fund !== 'object') {
    return funds
  }

  const id = fund._id ?? fund.id

  if (!id || !fund.name || funds.some((item) => item._id === id)) {
    return funds
  }

  return [...funds, { ...fund, _id: id, isDefault: false, name: `${fund.name} (archived)` }]
}

/**
 * What the Funds page says when an archive action fails.
 *
 * @param {Object} error - from axios
 * @param {'archive'|'restore'|'delete'} action
 */
export const getFundActionMessage = (error, action) => {
  if (!error?.response) {
    return 'Network error. Please check your connection and try again.'
  }

  if (error.response.status === 409 && error.response.data?.code === 'fund_has_history') {
    return 'This account has history — it stays in the archive.'
  }

  if (error.response.status === 404) {
    return action === 'delete'
      ? 'This account is already gone. The list was refreshed.'
      : 'Archiving is not available yet — please try again in a few minutes.'
  }

  return `Something went wrong while trying to ${action} the account. Please try again.`
}

/** A fund of an API that does not know `kind` is an account. */
export const isSavings = (fund) => fund?.kind === 'savings'

/**
 * Accounts first, then savings, each group in the order the API gave.
 *
 * @param {Array<{kind?: string}>} funds
 */
export const groupFundsByKind = (funds = []) => ({
  accounts: funds.filter((fund) => !isSavings(fund)),
  savings: funds.filter(isSavings)
})

/**
 * Items for a fund `v-select`: accounts, then a "Savings" subheader and the savings.
 * Without savings the list is the funds untouched.
 */
export const buildFundPickerItems = (funds = []) => {
  const { accounts, savings } = groupFundsByKind(funds)

  if (!savings.length) {
    return accounts
  }

  return [...accounts, { type: 'subheader', title: 'Savings' }, ...savings]
}

/**
 * The fund an expense form starts on. Savings are never the default, whatever the
 * API says about `isDefault`.
 */
export const pickDefaultFund = (funds = []) =>
  funds.find((fund) => fund.isDefault && !isSavings(fund)) ?? null

/** "Mar 2027", in the Bangkok calendar the API counts months in. */
export const formatGoalMonth = (date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' }).format(
    new Date(date)
  )

/**
 * The goal block of a savings card, from the fund as the API sends it.
 * Null when the fund has no goal.
 *
 * @param {Object} fund
 * @param {{formatAmount: (amount: number, currency?: string) => string, symbol?: string}} options
 * @returns {null|{percent: number, reached: boolean, progressText: string, hintText: string|null}}
 *   `percent` is capped at 100 for the bar.
 */
export const getGoalDisplay = (fund, { formatAmount, symbol = '' }) => {
  const goal = fund?.goal

  if (!goal || !(goal.amount > 0)) {
    return null
  }

  const progress = fund.goalProgress
  const balance = Number(fund.currentBalance) || 0
  const rawPercent = progress?.percent ?? (balance / goal.amount) * 100
  const reached = progress?.reached ?? balance >= goal.amount
  const money = (amount) => formatAmount(amount, fund.currency)

  let hintText = null

  if (reached) {
    hintText = 'Goal reached'
  } else if (progress?.perMonth != null && goal.date) {
    hintText = `≈ ${`${money(progress.perMonth)} ${symbol}`.trim()}/month until ${formatGoalMonth(goal.date)}`
  }

  return {
    percent: Math.min(Math.max(Number(rawPercent) || 0, 0), 100),
    reached,
    progressText: `${money(balance)} / ${money(goal.amount)} ${symbol}`.trim(),
    hintText
  }
}

/** `YYYY-MM-DD` for an `<input type="date">`; '' when there is none. */
export const goalDateToInput = (date) => {
  const value = date ? new Date(date) : null

  return value && !Number.isNaN(value.getTime())
    ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(value)
    : ''
}

/**
 * The `kind` and `goal` part of the create/update body.
 *
 * Against an API that predates savings nothing is added for an account, so the request
 * is the one it gets today. `apiKnowsKind` is true when the fund being edited came back
 * with a `kind`; a new fund cannot tell, and only a savings fund needs the fields.
 *
 * @param {{kind: 'account'|'savings', goalAmount: string|number, goalDate: string, apiKnowsKind: boolean}} form
 */
export const buildKindFields = ({ kind, goalAmount, goalDate, apiKnowsKind }) => {
  if (kind !== 'savings') {
    return apiKnowsKind ? { kind: 'account', goal: null } : {}
  }

  const amount = Number(goalAmount)
  const goal =
    goalAmount !== '' && goalAmount != null && amount > 0
      ? { amount, date: goalDate || null }
      : null

  return { kind: 'savings', goal }
}

/** What is wrong with the goal block, or null. Amount and date belong together. */
export const getGoalError = ({ goalAmount, goalDate }) => {
  const hasAmount = goalAmount !== '' && goalAmount != null

  if (hasAmount && !(Number(goalAmount) > 0)) {
    return 'The target must be more than 0.'
  }

  if (!hasAmount && goalDate) {
    return 'Enter a target amount, or clear the date.'
  }

  return null
}
