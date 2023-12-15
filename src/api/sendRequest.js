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
  const { url, headers, body, method = 'GET', params } = requestConfig
  const requestUrl = `${import.meta.env.VITE_BASE_URL}${url}`

  const response = await axiosInstance(requestUrl, {
    method,
    data: JSON.stringify(body),
    headers: {
      ...headers
    },
    params
  })

  return response.data
}