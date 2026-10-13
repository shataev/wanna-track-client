import { AxiosError } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import http, { REFRESH_URL, SIGN_OUT_URL, setAuthFailureHandler } from '@/api/http'
import { signOut } from '@/services/authService'
import useAuthStore from '@/stores/auth'
import useUserStore from '@/stores/user'

// Answers sign-out with `status` and every other request with a 401
function createServer(status) {
  const calls = []

  http.defaults.adapter = async (config) => {
    calls.push({ url: config.url, method: config.method })

    const response = { status, statusText: String(status), data: {}, headers: {}, config }

    if (config.url !== SIGN_OUT_URL || status >= 400) {
      throw new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, null, {
        ...response,
        status: config.url === SIGN_OUT_URL ? status : 401
      })
    }

    return response
  }

  return calls
}

const originalAdapter = http.defaults.adapter

beforeEach(() => {
  setActivePinia(createPinia())
  setAuthFailureHandler(vi.fn())
  useAuthStore().accessToken = 'token'
  useUserStore().setUser({ id: 'user-a', email: 'alice@example.com' })
})

afterEach(() => {
  http.defaults.adapter = originalAdapter
})

describe('signOut', () => {
  it('ends the session on the API, then forgets the token and the user', async () => {
    const calls = createServer(200)

    await signOut()

    expect(calls).toEqual([{ url: SIGN_OUT_URL, method: 'post' }])
    expect(useAuthStore().accessToken).toBeNull()
    expect(useUserStore().user.id).toBeNull()
  })

  it('keeps the user signed in here when the API did not end the session', async () => {
    createServer(500)

    await expect(signOut()).rejects.toMatchObject({ response: { status: 500 } })

    expect(useAuthStore().accessToken).toBe('token')
    expect(useUserStore().user.id).toBe('user-a')
  })

  it('does not refresh on a 401 from sign-out', async () => {
    const calls = createServer(401)

    await expect(signOut()).rejects.toMatchObject({ response: { status: 401 } })

    expect(calls.filter(({ url }) => url === REFRESH_URL)).toHaveLength(0)
  })
})
