import sendRequest from '@/api/sendRequest'

// [{ id, clientName, scopes, createdAt, lastUsedAt }]: the apps that can reach the MCP endpoint
export const fetchConnectedApps = async () =>
  (await sendRequest({ url: '/api/oauth/grants', method: 'get' })) ?? []

// Revokes the grant and every token issued under it
export const disconnectApp = (grantId) =>
  sendRequest({ url: `/api/oauth/grants/${grantId}`, method: 'delete' })
