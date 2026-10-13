// A session is one signed-in device: the refresh cookie of one browser

// The contract names it `id`; a plain Mongoose document would answer `_id`
export const getSessionId = (session) => session?.id ?? session?._id

export const getSessionDevice = (session) => session?.device || 'Unknown device'

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * The status line under a device's name.
 *
 * @param {Object} session - from GET /api/sessions
 */
export const describeSessionUsage = (session) => {
  const signedIn = session.createdAt ? `Signed in ${formatDate(session.createdAt)}` : 'Signed in'

  if (session.current) {
    return `${signedIn} · active now`
  }

  return session.lastUsedAt ? `${signedIn} · last active ${formatDate(session.lastUsedAt)}` : signedIn
}

const lastActivity = (session) => new Date(session.lastUsedAt || session.createdAt || 0).getTime()

/**
 * This device first, then the most recently active. The API already answers in this
 * order; sorting again keeps "This device" on top whatever it sends.
 *
 * @param {Array<Object>} sessions - from GET /api/sessions
 */
export const sortSessions = (sessions = []) =>
  [...sessions].sort(
    (a, b) => Number(Boolean(b.current)) - Number(Boolean(a.current)) || lastActivity(b) - lastActivity(a)
  )

export const getSignOutQuestion = (session) =>
  session?.current
    ? 'Sign out of this device? You will need your password to sign in again.'
    : `Sign out ${getSessionDevice(session)}? It will need your password to sign in again.`

export const SIGN_OUT_OTHERS_QUESTION =
  'Sign out of all other devices? This one stays signed in; every other one will need your password.'

/**
 * A 404 on sign-out of a device means its session is already gone (signed out from
 * another tab, or expired): the outcome the user asked for, so it is not a failure.
 *
 * @param {Object} error - from axios
 */
export const isAlreadySignedOut = (error) => error?.response?.status === 404

/**
 * What the Devices section says when the API refuses.
 *
 * @param {Object} error - from axios
 * @param {string} action - as in "Could not <action>"
 */
export const getSessionsErrorMessage = (error, action) => {
  if (!error?.response) {
    return 'Network error. Please check your connection and try again.'
  }

  return `Could not ${action}. Please try again.`
}
