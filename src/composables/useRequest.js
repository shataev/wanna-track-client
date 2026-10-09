// useRequest.js
import { ref } from 'vue'
import sendRequest from '@/api/sendRequest'

export function useRequest() {
  const data = ref(null)

  const loading = ref(false)
  const error = ref(null)

  const fetchData = async (requestConfig) => {
    loading.value = true
    error.value = null

    try {
      data.value = await sendRequest(requestConfig)

      return data.value
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetchData }
}
