import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Verification-Code': import.meta.env.VITE_VERIFICATION_CODE
  },
  withCredentials: true
})
export default async function (requestConfig) {
  const { url, headers, body, method = 'GET', onUnauthorizedHandler } = requestConfig
  const requestUrl = `${import.meta.env.VITE_BASE_URL}${url}`

  try {
    const response = await axiosInstance(requestUrl, {
      method,
      data: JSON.stringify(body),
      headers: {
        ...headers
      }
    })

    return response.data
  } catch (e) {
    console.log('[error]', e)

    if (e.response?.status === 401) {
      return onUnauthorizedHandler?.()
    }
  }
}
