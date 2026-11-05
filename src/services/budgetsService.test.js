import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/api/http'
import { fetchBudgets, removeBudget, setBudget } from '@/services/budgetsService'

const originalAdapter = http.defaults.adapter

// Answers with `respond(config)`; a status >= 400 rejects like axios does
function stubApi(respond) {
  const calls = []

  http.defaults.adapter = async (config) => {
    calls.push({
      url: config.url,
      method: config.method,
      params: config.params,
      body: config.data === undefined ? undefined : JSON.parse(config.data)
    })

    const { status = 200, data } = respond(config)

    if (status >= 400) {
      const error = new Error(`Request failed with status code ${status}`)
      error.config = config
      error.response = { status, data, headers: {}, config }
      error.isAxiosError = true
      throw error
    }

    return { status, statusText: 'OK', data, headers: {}, config }
  }

  return calls
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  http.defaults.adapter = originalAdapter
  vi.restoreAllMocks()
})

describe('fetchBudgets', () => {
  it('asks for the current month without params, or for a given one', async () => {
    const calls = stubApi(() => ({ data: { budgets: [] } }))

    await fetchBudgets()
    await fetchBudgets('2026-10')

    expect(calls.map(({ url, method, params }) => ({ url, method, params }))).toEqual([
      { url: '/api/budgets', method: 'get', params: undefined },
      { url: '/api/budgets', method: 'get', params: { month: '2026-10' } }
    ])
  })

  it('answers the payload', async () => {
    const payload = { currency: 'THB', daysInMonth: 30, budgets: [{ id: 'b1' }] }
    stubApi(() => ({ data: payload }))

    expect(await fetchBudgets()).toEqual(payload)
  })

  it('answers null, silently, against an API without the route', async () => {
    stubApi(() => ({ status: 404, data: { message: 'Not found' } }))

    expect(await fetchBudgets()).toBeNull()
  })

  it('answers null for a server error or an unexpected body', async () => {
    stubApi(() => ({ status: 500 }))
    expect(await fetchBudgets()).toBeNull()

    stubApi(() => ({ data: '<html>' }))
    expect(await fetchBudgets()).toBeNull()
  })
})

describe('setBudget and removeBudget', () => {
  it('put the amount to the category and delete it', async () => {
    const calls = stubApi(() => ({ data: {} }))

    await setBudget('cat-1', 3000)
    await removeBudget('cat-1')

    expect(calls.map(({ url, method, body }) => ({ url, method, body }))).toEqual([
      { url: '/api/budgets/cat-1', method: 'put', body: { amount: 3000 } },
      { url: '/api/budgets/cat-1', method: 'delete', body: undefined }
    ])
  })

  it('let a refusal through: the owner asked for it', async () => {
    stubApi(() => ({ status: 400, data: { message: 'bad' } }))

    await expect(setBudget('cat-1', 3000)).rejects.toMatchObject({ response: { status: 400 } })
  })
})
