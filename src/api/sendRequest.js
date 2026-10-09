import http from '@/api/http'

export default async function (requestConfig) {
  const { url, headers, body, method = 'GET', params } = requestConfig

  const response = await http(url, {
    method,
    data: body,
    headers,
    params
  })

  return response.data
}
