import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import http from '@/api/http'
import { disconnectApp, fetchConnectedApps } from '@/services/connectedAppsService'

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

describe('connectedAppsService', () => {
  it('lists grants, and answers an empty list when the answer has no body', async () => {
    const calls = captureRequests(null)

    expect(await fetchConnectedApps()).toEqual([])
    expect(calls).toEqual([{ url: '/api/oauth/grants', method: 'get', data: undefined }])
  })

  it('disconnects by grant id, sending no user id', async () => {
    const calls = captureRequests({})

    await disconnectApp('g1')

    expect(calls).toEqual([{ url: '/api/oauth/grants/g1', method: 'delete', data: undefined }])
  })
})
