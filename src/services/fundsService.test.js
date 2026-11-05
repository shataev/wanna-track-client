import { afterEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import http from '@/api/http'
import { archiveFund, deleteFund, fetchArchivedFunds, fetchFunds, restoreFund } from '@/services/fundsService'

const originalAdapter = http.defaults.adapter

function stubApi(data) {
  const calls = []

  http.defaults.adapter = async (config) => {
    calls.push({ url: config.url, method: config.method, params: config.params })

    return { status: 200, statusText: 'OK', data, headers: {}, config }
  }

  return calls
}

afterEach(() => {
  http.defaults.adapter = originalAdapter
})

describe('fundsService', () => {
  it('asks for archived funds and keeps only archived ones', async () => {
    setActivePinia(createPinia())
    const calls = stubApi({ funds: [{ _id: 'a', archivedAt: 'x' }, { _id: 'b' }] })

    expect(await fetchArchivedFunds()).toEqual([{ _id: 'a', archivedAt: 'x' }])
    expect(calls[0]).toMatchObject({ url: '/api/funds', method: 'get', params: { archived: true } })
  })

  it('lists active funds without the archived ones and keeps the total', async () => {
    setActivePinia(createPinia())
    stubApi({ funds: [{ _id: 'a', archivedAt: 'x' }, { _id: 'b' }], total: { amount: 5 } })

    expect(await fetchFunds()).toEqual({ funds: [{ _id: 'b' }], total: { amount: 5 } })
  })

  it('archives, restores and deletes by id', async () => {
    setActivePinia(createPinia())
    const calls = stubApi({})

    await archiveFund('f1')
    await restoreFund('f1')
    await deleteFund('f1')

    expect(calls.map(({ url, method }) => [method, url])).toEqual([
      ['post', '/api/funds/f1/archive'],
      ['post', '/api/funds/f1/restore'],
      ['delete', '/api/funds/f1']
    ])
  })
})
