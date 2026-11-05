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
