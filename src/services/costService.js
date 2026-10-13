import sendRequest from '@/api/sendRequest'

// One of the user's costs with its category, fund ({ _id, name, currency }), tags and fundAmount
export const fetchCost = (costId) => sendRequest({ url: `/api/cost/${costId}`, method: 'get' })

// Any of amount, currency, fundId, category, date, comment, tags; answers the updated cost
export const updateCost = (costId, body) =>
  sendRequest({ url: `/api/cost/${costId}`, method: 'patch', body })

// The API gives a fund back what the cost debited from it
export const deleteCost = (costId) => sendRequest({ url: `/api/cost/${costId}`, method: 'delete' })
