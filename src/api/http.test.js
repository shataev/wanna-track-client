import { AxiosError } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import http, { REFRESH_URL, setAuthFailureHandler } from '@/api/http'
import useAuthStore from '@/stores/auth'
import useUserStore from '@/stores/user'

const USER = {
  id: 'user-a',
  username: 'alice',
  email: 'alice@example.com',
  defaultCurrency: 'EUR',
  telegramId: null,
  verified: true
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

// Stands in for the network: refresh answers with `refreshResult` and hands
// out `issuedToken`; everything else accepts only `validToken`
function createServer({ validToken = 'fresh-token', issuedToken = validToken, refreshResult = 'ok' } = {}) {
  const calls = []

  const respond = (config, status, data) => {
    const response = { status, statusText: String(status), data, headers: {}, config }

    if (status >= 400) {
      throw new AxiosError(`Request failed with status code ${status}`, AxiosError.ERR_BAD_REQUEST, config, null, response)
    }

    return response
  }

  http.defaults.adapter = async (config) => {
    const authorization = config.headers.Authorization ?? null
    calls.push({ url: config.url, method: config.method, authorization })

    // Let concurrent requests pile up behind the refresh before it settles
    await tick()

    if (config.url === REFRESH_URL) {
      return refreshResult === 'ok'
        ? respond(config, 200, { accessToken: issuedToken, user: USER })
        : respond(config, 401, { error: 'Unauthorized' })
    }

    if (config.url === '/api/auth/signin') {
      return respond(config, 401, { error: 'Invalid credentials' })
    }

    return authorization === `Bearer ${validToken}`
      ? respond(config, 200, { url: config.url })
      : respond(config, 401, { error: 'Unauthorized' })
  }

  return {
    calls,
    refreshCalls: () => calls.filter(({ url }) => url === REFRESH_URL)
  }
}

describe('http auth interceptors', () => {
  let onAuthFailure

  beforeEach(() => {
    setActivePinia(createPinia())
    onAuthFailure = vi.fn()
    setAuthFailureHandler(onAuthFailure)
  })

  it('sends the token from the store as a bearer', async () => {
    const server = createServer()
    useAuthStore().accessToken = 'fresh-token'

    await http.get('/api/funds')

    expect(server.calls).toEqual([
      { url: '/api/funds', method: 'get', authorization: 'Bearer fresh-token' }
    ])
  })

  it('refreshes once for two concurrent 401s and retries both with the new token', async () => {
    const server = createServer()
    useAuthStore().accessToken = 'expired-token'

    const [funds, costs] = await Promise.all([http.get('/api/funds'), http.get('/api/costs')])

    expect(funds.data).toEqual({ url: '/api/funds' })
    expect(costs.data).toEqual({ url: '/api/costs' })
    expect(server.refreshCalls()).toHaveLength(1)

    const retries = server.calls.filter(({ url }) => url !== REFRESH_URL).slice(2)
    expect(retries).toEqual(
      expect.arrayContaining([
        { url: '/api/funds', method: 'get', authorization: 'Bearer fresh-token' },
        { url: '/api/costs', method: 'get', authorization: 'Bearer fresh-token' }
      ])
    )
    expect(retries).toHaveLength(2)

    expect(useAuthStore().accessToken).toBe('fresh-token')
    expect(useUserStore().user).toEqual(USER)
    expect(onAuthFailure).not.toHaveBeenCalled()
  })

  it('clears the session and sends the user to sign-in when the refresh fails', async () => {
    const server = createServer({ refreshResult: 'unauthorized' })
    useAuthStore().accessToken = 'expired-token'
    useUserStore().setUser(USER)

    const results = await Promise.allSettled([http.get('/api/funds'), http.get('/api/costs')])

    expect(results.map(({ status }) => status)).toEqual(['rejected', 'rejected'])
    expect(results.map(({ reason }) => reason.response.status)).toEqual([401, 401])
    expect(server.refreshCalls()).toHaveLength(1)
    expect(onAuthFailure).toHaveBeenCalled()
    expect(useAuthStore().accessToken).toBeNull()
    expect(useUserStore().user.id).toBeNull()
  })

  it('does not retry a 401 from the refresh endpoint itself', async () => {
    const server = createServer({ refreshResult: 'unauthorized' })

    await expect(http.post(REFRESH_URL)).rejects.toMatchObject({ response: { status: 401 } })

    expect(server.calls).toHaveLength(1)
  })

  it('does not refresh on a 401 from sign-in', async () => {
    const server = createServer()

    await expect(http.post('/api/auth/signin', {})).rejects.toMatchObject({
      response: { status: 401 }
    })

    expect(server.refreshCalls()).toHaveLength(0)
    expect(onAuthFailure).not.toHaveBeenCalled()
  })

  it('retries a request only once', async () => {
    // Refresh succeeds but the API still rejects the new token
    const server = createServer({ issuedToken: 'rejected-token' })

    await expect(http.get('/api/funds')).rejects.toMatchObject({ response: { status: 401 } })

    expect(server.calls.filter(({ url }) => url === '/api/funds')).toHaveLength(2)
    expect(server.refreshCalls()).toHaveLength(1)
  })
})
