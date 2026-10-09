import sendRequest from '@/api/sendRequest'

// Every amount comes back in the user's default currency, converted the same
// way as GET /api/costs. `previous` is the period of the same length right
// before dateFrom; `projection` is null unless today is inside the period.
export const fetchAnalyticsSummary = ([dateFrom, dateTo]) =>
  sendRequest({
    url: '/api/analytics/summary',
    method: 'get',
    params: { dateFrom, dateTo }
  })

// { currency, months: [{ month: 'YYYY-MM', total, categories }] }, oldest first,
// months without expenses included with total 0
export const fetchAnalyticsMonthly = (months = 12) =>
  sendRequest({
    url: '/api/analytics/monthly',
    method: 'get',
    params: { months }
  })
