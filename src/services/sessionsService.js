import sendRequest from '@/api/sendRequest'

// [{ id, current, device, createdAt, lastUsedAt, expiresAt }]: the active sign-ins,
// this device first
export const fetchSessions = async () =>
  (await sendRequest({ url: '/api/sessions', method: 'get' })) ?? []

// Signs that device out at its next refresh, at the latest 15 minutes from now
export const revokeSession = (sessionId) =>
  sendRequest({ url: `/api/sessions/${sessionId}`, method: 'delete' })

export const revokeOtherSessions = () =>
  sendRequest({ url: '/api/sessions/revoke-others', method: 'post' })
