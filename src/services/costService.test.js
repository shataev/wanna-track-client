import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import http from '@/api/http'
import { deleteCost, fetchCost, updateCost } from '@/services/costService'

// Records what would go over the wire and answers `data`
function captureRequests(data = {}) {
  const calls = []

  http.defaults.adapter = async (config) => {
    calls.push({
      url: config.url,
      method: config.method,
      body: config.data === undefined ? undefined : JSON.parse(config.data)
    })

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

describe('costService', () => {
  it('reads, updates and deletes one cost by its id, never sending a user id', async () => {
    const calls = captureRequests({ _id: 'cost-1' })

    await fetchCost('cost-1')
    await updateCost('cost-1', { amount: 100, fundId: null })
    await deleteCost('cost-1')

    expect(calls).toEqual([
      { url: '/api/cost/cost-1', method: 'get', body: undefined },
      { url: '/api/cost/cost-1', method: 'patch', body: { amount: 100, fundId: null } },
      { url: '/api/cost/cost-1', method: 'delete', body: undefined }
    ])
  })
})
