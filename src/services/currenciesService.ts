import sendRequest from '@/api/sendRequest'

export interface Currency {
  code: string
  name: string
  symbol: string
}

export interface CurrenciesResponse {
  currencies: Currency[]
  count: number
}

export const fetchCurrencies = async (): Promise<Currency[]> => {
  const response = await sendRequest({
    url: '/api/exchange-rates/currencies',
    method: 'GET'
  }) as CurrenciesResponse

  return response.currencies
}

