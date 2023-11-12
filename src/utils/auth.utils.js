import sendRequest from '@/api/sendRequest'
import { WANNA_TRACK_ACCESS_TOKEN } from '@/constants'

export const getUserByAccessTokenFromLocalStorage = async () => {
  const accessToken = localStorage.getItem(WANNA_TRACK_ACCESS_TOKEN)

  if (!accessToken) {
    return null
  }

  const user = await sendRequest({
    url: '/api/auth/',
    method: 'get',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    // TODO make it common to all requests
    onUnauthorizedHandler() {
      localStorage.removeItem(WANNA_TRACK_ACCESS_TOKEN)
    }
  })

  return user
}
export const checkAuth = async (accessToken) => {
  if (!accessToken) {
    return false
  }

  const user = await sendRequest({
    url: '/api/auth/',
    method: 'get',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  return user
}
