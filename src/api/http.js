import axios from 'axios'
import useAuthStore from '@/stores/auth'

export const REFRESH_URL = '/api/auth/refresh'
const SIGN_IN_URL = '/api/auth/signin'

// A 401 from these means the credentials themselves were rejected,
// so refreshing and retrying would only loop
const NO_RETRY_URLS = [REFRESH_URL, SIGN_IN_URL]

const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // The refresh token lives in an httpOnly cookie
  withCredentials: true
})

let refreshPromise = null
let onAuthFailure = () => {}

// Injected by the router, so this module does not depend on it
export function setAuthFailureHandler(handler) {
  onAuthFailure = handler
}

// Every caller during a refresh awaits the same request: the API rotates
// the refresh cookie, so a second parallel refresh would present a stale one
export function refreshSession() {
  if (!refreshPromise) {
    const authStore = useAuthStore()

    refreshPromise = http
      .post(REFRESH_URL)
      .then(({ data }) => {
        authStore.setSession(data)

        return data.accessToken
      })
      .catch((error) => {
        authStore.clearSession()

        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

const isNoRetryUrl = (url = '') => {
  const path = url.split('?')[0]

  return NO_RETRY_URLS.some((noRetryUrl) => path.endsWith(noRetryUrl))
}

http.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error

    if (response?.status !== 401 || !config || config._retried || isNoRetryUrl(config.url)) {
      throw error
    }

    config._retried = true

    try {
      await refreshSession()
    } catch {
      onAuthFailure()

      throw error
    }

    // The request interceptor puts the new token on the retry
    return http(config)
  }
)

export default http
