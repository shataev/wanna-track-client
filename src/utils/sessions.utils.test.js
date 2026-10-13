import { describe, expect, it } from 'vitest'
import {
  describeSessionUsage,
  getSessionDevice,
  getSessionId,
  getSessionsErrorMessage,
  getSignOutQuestion,
  isAlreadySignedOut,
  sortSessions
} from '@/utils/sessions.utils'

describe('getSessionId', () => {
  it('reads id, or _id from a plain document', () => {
    expect(getSessionId({ id: 's1' })).toBe('s1')
    expect(getSessionId({ _id: 's2' })).toBe('s2')
  })
})

describe('getSessionDevice', () => {
  it('shows the device the API parsed, or a neutral name', () => {
    expect(getSessionDevice({ device: 'iPhone · Safari' })).toBe('iPhone · Safari')
    expect(getSessionDevice({ device: '' })).toBe('Unknown device')
  })
})

describe('describeSessionUsage', () => {
  it('says when the device signed in and was last active', () => {
    expect(
      describeSessionUsage({ createdAt: '2026-10-01T10:00:00Z', lastUsedAt: '2026-10-12T10:00:00Z' })
    ).toBe('Signed in Oct 1, 2026 · last active Oct 12, 2026')
  })

  it('calls this device active now', () => {
    expect(
      describeSessionUsage({
        current: true,
        createdAt: '2026-10-01T10:00:00Z',
        lastUsedAt: '2026-10-01T10:00:00Z'
      })
    ).toBe('Signed in Oct 1, 2026 · active now')
  })

  it('leaves out what it does not know', () => {
    expect(describeSessionUsage({})).toBe('Signed in')
  })
})

describe('sortSessions', () => {
  it('puts this device first, then the most recently active', () => {
    const sessions = [
      { id: 'old', lastUsedAt: '2026-10-01T00:00:00Z' },
      { id: 'recent', lastUsedAt: '2026-10-12T00:00:00Z' },
      { id: 'here', current: true, lastUsedAt: '2026-09-01T00:00:00Z' }
    ]

    expect(sortSessions(sessions).map(getSessionId)).toEqual(['here', 'recent', 'old'])
    expect(sessions[0].id).toBe('old')
  })
})

describe('getSignOutQuestion', () => {
  it('names the device, and says plainly when it is this one', () => {
    expect(getSignOutQuestion({ device: 'Mac · Chrome' })).toMatch(/^Sign out Mac · Chrome\?/)
    expect(getSignOutQuestion({ device: 'Mac · Chrome', current: true })).toMatch(
      /^Sign out of this device\?/
    )
  })
})

describe('isAlreadySignedOut', () => {
  it('is a 404 only', () => {
    expect(isAlreadySignedOut({ response: { status: 404 } })).toBe(true)
    expect(isAlreadySignedOut({ response: { status: 500 } })).toBe(false)
    expect(isAlreadySignedOut({})).toBe(false)
  })
})

describe('getSessionsErrorMessage', () => {
  it('tells a network failure apart from a refusal', () => {
    expect(getSessionsErrorMessage({}, 'load devices')).toMatch(/^Network error/)
    expect(getSessionsErrorMessage({ response: { status: 500 } }, 'load devices')).toBe(
      'Could not load devices. Please try again.'
    )
  })
})
