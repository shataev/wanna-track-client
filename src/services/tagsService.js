import sendRequest from '@/api/sendRequest'
import { normalizeTag, normalizeTags } from '@/utils/tags.utils'

// [{ tag, count, total, currency, firstDate, lastDate }], most recent first
export const fetchTags = async () => (await sendRequest({ url: '/api/tags', method: 'get' })) ?? []

// Answers the full user; an empty tag clears it
export const setActiveTag = (tag) =>
  sendRequest({
    url: '/api/me/active-tag',
    method: 'put',
    body: { tag: normalizeTag(tag) || null }
  })

export const updateCostTags = (costId, tags) =>
  sendRequest({
    url: `/api/cost/${costId}`,
    method: 'patch',
    body: { tags: normalizeTags(tags) }
  })
