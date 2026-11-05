import sendRequest from '@/api/sendRequest'
import { pickActiveFunds, pickArchivedFunds } from '@/utils/fund.utils'

export const fetchFunds = async () => {
  const response = await sendRequest({ url: '/api/funds', method: 'get' })

  return { ...response, funds: pickActiveFunds(response.funds) }
}

export const fetchArchivedFunds = async () =>
  pickArchivedFunds(await sendRequest({ url: '/api/funds', method: 'get', params: { archived: true } }))

export const archiveFund = (id) => sendRequest({ url: `/api/funds/${id}/archive`, method: 'post' })

export const restoreFund = (id) => sendRequest({ url: `/api/funds/${id}/restore`, method: 'post' })

export const deleteFund = (id) => sendRequest({ url: `/api/funds/${id}`, method: 'delete' })
