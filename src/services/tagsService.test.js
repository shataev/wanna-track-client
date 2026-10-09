import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import http from '@/api/http'
import { fetchTags, setActiveTag, updateCostTags } from '@/services/tagsService'
import useUserStore from '@/stores/user'

const USER = {
  id: 'user-a',
  username: 'alice',
  email: 'alice@example.com',
  defaultCurrency: 'THB',
  telegramId: null,
  verified: true,
  activeTag: 'japan-2026'
}

// Records what would go over the wire and answers `data`
function captureRequests(data = USER) {
  const calls = []

  http.defaults.adapter = async (config) => {
    calls.push({
      url: config.url,
      method: config.method,
      body: config.data === undefined ? undefined : JSON.parse(config.data)
    })

    return { status: 200, statusText: 'OK', data, headers: {}, config }
  }

  return calls
}

const originalAdapter = http.defaults.adapter

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  http.defaults.adapter = originalAdapter
})

describe('setActiveTag', () => {
  it('sends the normalised tag', async () => {
    const calls = captureRequests()

    await setActiveTag('  Japan 2026 ')

    expect(calls).toEqual([{ url: '/api/me/active-tag', method: 'put', body: { tag: 'japan-2026' } }])
  })

  it('clears with null, also when nothing valid was typed', async () => {
    const calls = captureRequests()

    await setActiveTag(null)
    await setActiveTag('  !! ')

    expect(calls.map(({ body }) => body)).toEqual([{ tag: null }, { tag: null }])
  })

  it('answers the full user, which the store keeps with its active tag', async () => {
    captureRequests()

    const userStore = useUserStore()
    userStore.setUser(await setActiveTag('japan-2026'))

    expect(userStore.user.activeTag).toBe('japan-2026')
  })
})

describe('updateCostTags', () => {
  it('patches only the tags of that cost', async () => {
    const calls = captureRequests({})

    await updateCostTags('cost-1', ['Food', 'japan-2026', 'food'])

    expect(calls).toEqual([
      { url: '/api/cost/cost-1', method: 'patch', body: { tags: ['food', 'japan-2026'] } }
    ])
  })

  it('sends an empty list to remove every tag', async () => {
    const calls = captureRequests({})

    await updateCostTags('cost-1', [])

    expect(calls[0].body).toEqual({ tags: [] })
  })
})

describe('fetchTags', () => {
  it('answers the list from the API', async () => {
    const tags = [{ tag: 'japan-2026', count: 3, total: 4200, currency: 'THB' }]
    const calls = captureRequests(tags)

    expect(await fetchTags()).toEqual(tags)
    expect(calls).toEqual([{ url: '/api/tags', method: 'get', body: undefined }])
  })
})

describe('user store', () => {
  it('has no active tag until the API says so', () => {
    const userStore = useUserStore()
    const { activeTag, ...withoutTag } = USER

    userStore.setUser(withoutTag)

    expect(activeTag).toBe('japan-2026')
    expect(userStore.user.activeTag).toBeNull()
  })
})
