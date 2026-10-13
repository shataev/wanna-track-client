import { describe, expect, it } from 'vitest'
import {
  describeGrantScopes,
  describeGrantUsage,
  getConnectedAppsErrorMessage,
  getDisconnectQuestion,
  getGrantClientName,
  getGrantId,
  getMcpUrl,
  isAlreadyDisconnected,
  sortGrants
} from '@/utils/connectedApps.utils'

describe('getMcpUrl', () => {
  it('is the connector URL of the API this bundle talks to', () => {
    expect(getMcpUrl('https://api.wannatrack.shataev.com')).toBe(
      'https://api.wannatrack.shataev.com/mcp'
    )
    expect(getMcpUrl('http://localhost:3000/')).toBe('http://localhost:3000/mcp')
  })

  it('falls back to production when the base URL is not set', () => {
    expect(getMcpUrl(undefined)).toBe('https://api.wannatrack.shataev.com/mcp')
  })
})

describe('describeGrantScopes', () => {
  it('names what the app may do', () => {
    expect(describeGrantScopes(['expenses.read'])).toBe('Read only')
    expect(describeGrantScopes(['expenses.read', 'expenses.write', 'offline_access'])).toBe(
      'Read and add expenses'
    )
  })

  it('never claims write for scopes that only look like it', () => {
    expect(describeGrantScopes(['read', 'write'])).toBe('Read only')
    expect(describeGrantScopes(undefined)).toBe('Read only')
  })
})

describe('describeGrantUsage', () => {
  it('says when the app was connected and last used', () => {
    expect(
      describeGrantUsage({
        createdAt: '2026-10-05T10:00:00.000Z',
        lastUsedAt: '2026-10-12T10:00:00.000Z'
      })
    ).toBe('Connected Oct 5, 2026 · last used Oct 12, 2026')
  })

  it('says an app was never used', () => {
    expect(describeGrantUsage({ createdAt: '2026-10-05T10:00:00.000Z', lastUsedAt: null })).toBe(
      'Connected Oct 5, 2026 · never used'
    )
  })
})

describe('getGrantClientName and getGrantId', () => {
  it('reads the client name, in either spelling, with a fallback', () => {
    expect(getGrantClientName({ clientName: 'Claude' })).toBe('Claude')
    expect(getGrantClientName({ client_name: 'Claude Code' })).toBe('Claude Code')
    expect(getGrantClientName({})).toBe('Unknown app')
  })

  it('reads id, or _id from a plain document', () => {
    expect(getGrantId({ id: 'a' })).toBe('a')
    expect(getGrantId({ _id: 'b' })).toBe('b')
  })
})

describe('sortGrants', () => {
  it('puts the most recently active app first, without changing the list it was given', () => {
    const grants = [
      { id: 'idle', createdAt: '2026-10-01T00:00:00Z', lastUsedAt: null },
      { id: 'used', createdAt: '2026-09-01T00:00:00Z', lastUsedAt: '2026-10-12T00:00:00Z' },
      { id: 'new', createdAt: '2026-10-10T00:00:00Z', lastUsedAt: null }
    ]

    expect(sortGrants(grants).map(getGrantId)).toEqual(['used', 'new', 'idle'])
    expect(grants.map(getGrantId)).toEqual(['idle', 'used', 'new'])
  })
})

describe('disconnecting', () => {
  it('asks by the app name', () => {
    expect(getDisconnectQuestion({ clientName: 'Claude' })).toMatch(/^Disconnect Claude\?/)
  })

  it('treats a 404 as already disconnected, and nothing else', () => {
    expect(isAlreadyDisconnected({ response: { status: 404 } })).toBe(true)
    expect(isAlreadyDisconnected({ response: { status: 500 } })).toBe(false)
    expect(isAlreadyDisconnected(new Error('Network Error'))).toBe(false)
  })

  it('does not show what the server said on a failure', () => {
    const error = { response: { status: 500, data: { error: 'MongoServerError: boom' } } }

    expect(getConnectedAppsErrorMessage(error, 'disconnect the app')).toBe(
      'Could not disconnect the app. Please try again.'
    )
    expect(getConnectedAppsErrorMessage(new Error('x'), 'disconnect the app')).toMatch(
      /Network error/
    )
  })
})
