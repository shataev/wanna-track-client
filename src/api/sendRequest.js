export default async function (requestConfig) {
  try {
    const { url, headers, body, method = 'GET' } = requestConfig
    const requestUrl = `${import.meta.env.VITE_BASE_URL}${url}`

    const response = await fetch(requestUrl, {
      method,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    })

    const data = response.json()

    return data
  } catch (e) {
    console.log(e)
  }
}
