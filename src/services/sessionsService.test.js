import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import http from '@/api/http'
import { fetchSessions, revokeOtherSessions, revokeSession } from '@/services/sessionsService'

// Records what would go over the wire and answers `data`
function captureRequests(data) {
  const calls = []

  http.defaults.adapter = async (config) => {
    calls.push({ url: config.url, method: config.method, data: config.data })

    return { status: 200, statusText: 'OK', data, headers: {}, config }
  }

  return calls
}

const originalAdapter = http.defaults.adapter

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  http.defaults.adapter = originalAdapter
})

describe('sessionsService', () => {
  it('lists sessions, and answers an empty list when the answer has no body', async () => {
    const calls = captureRequests(null)

    expect(await fetchSessions()).toEqual([])
    expect(calls).toEqual([{ url: '/api/sessions', method: 'get', data: undefined }])
  })

  it('signs one device out by session id, sending no user id', async () => {
    const calls = captureRequests({})

    await revokeSession('s1')

    expect(calls).toEqual([{ url: '/api/sessions/s1', method: 'delete', data: undefined }])
  })

  it('signs out every other device', async () => {
    const calls = captureRequests({})

    await revokeOtherSessions()

    expect(calls).toEqual([{ url: '/api/sessions/revoke-others', method: 'post', data: undefined }])
  })
})
