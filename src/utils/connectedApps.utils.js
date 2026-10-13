// A grant is one app (an OAuth client such as Claude) the user allowed to reach
// their expenses through the API's MCP endpoint
export const WRITE_SCOPE = 'expenses.write'

const PRODUCTION_API_URL = 'https://api.wannatrack.shataev.com'

/**
 * The MCP endpoint of the API this bundle talks to, so a local build shows the local URL.
 *
 * @param {string} [baseUrl] - VITE_BASE_URL
 */
export const getMcpUrl = (baseUrl) => `${(baseUrl || PRODUCTION_API_URL).replace(/\/+$/, '')}/mcp`

// The contract names it `id`; a plain Mongoose document would answer `_id`
export const getGrantId = (grant) => grant?.id ?? grant?._id

export const getGrantClientName = (grant) =>
  grant?.clientName || grant?.client_name || 'Unknown app'

export const describeGrantScopes = (scopes = []) =>
  scopes.includes(WRITE_SCOPE) ? 'Read and add expenses' : 'Read only'

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * The status line under an app's name.
 *
 * @param {Object} grant - from GET /api/oauth/grants
 */
export const describeGrantUsage = (grant) => {
  const connected = grant.createdAt ? `Connected ${formatDate(grant.createdAt)}` : 'Connected'
  const used = grant.lastUsedAt ? `last used ${formatDate(grant.lastUsedAt)}` : 'never used'

  return `${connected} · ${used}`
}

const lastActivity = (grant) => new Date(grant.lastUsedAt || grant.createdAt || 0).getTime()

/**
 * The most recently used or connected app first.
 *
 * @param {Array<Object>} grants - from GET /api/oauth/grants
 */
export const sortGrants = (grants = []) =>
  [...grants].sort((a, b) => lastActivity(b) - lastActivity(a))

export const getDisconnectQuestion = (grant) =>
  `Disconnect ${getGrantClientName(grant)}? It loses access to your expenses at once. ` +
  'You can connect it again later.'

/**
 * A 404 on disconnect means the app is already gone (another tab, another device):
 * the outcome the user asked for, so it is not shown as a failure.
 *
 * @param {Object} error - from axios
 */
export const isAlreadyDisconnected = (error) => error?.response?.status === 404

/**
 * What the Connected apps section says when the API refuses.
 *
 * @param {Object} error - from axios
 * @param {string} action - as in "Could not <action>"
 */
export const getConnectedAppsErrorMessage = (error, action) => {
  if (!error?.response) {
    return 'Network error. Please check your connection and try again.'
  }

  return `Could not ${action}. Please try again.`
}
