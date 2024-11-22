// useRequest.js
import { ref } from 'vue'
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

export function useRequest() {
  const data = ref(null)

  const loading = ref(false)
  const error = ref(null)

  const fetchData = async (requestConfig) => {
    loading.value = true
    error.value = null

    const { url, headers, body, method = 'GET', params } = requestConfig
    const requestUrl = `${import.meta.env.VITE_BASE_URL}${url}`

    try {
      //const response = await axios(url, options);
      const response = await axiosInstance(requestUrl, {
        method,
        data: JSON.stringify(body),
        headers: {
          ...headers
        },
        params
      })
      data.value = response.data
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Automatically fetch data if URL is provided
  //if (requestUrl) fetchData()

  return { data, loading, error, fetchData }
}
