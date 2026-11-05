import sendRequest from '@/api/sendRequest'

// GET /api/budgets answers the current Bangkok month unless `month` ('YYYY-MM') is given:
// { currency, month, dateFrom, dateTo, daysInMonth, elapsedDays, pacePercent, budgets: [...] }.
// Limits only decorate the page, so a failure (an API that does not have the route yet
// answers 404) is no reason to show anything: null means "no budgets here".
export const fetchBudgets = async (month) => {
  try {
    const data = await sendRequest({
      url: '/api/budgets',
      method: 'get',
      params: month ? { month } : undefined
    })

    return data && Array.isArray(data.budgets) ? data : null
  } catch (error) {
    console.warn('[budgets] not available', error)

    return null
  }
}

// Create or replace the monthly limit of a category; answers the budget
export const setBudget = (categoryId, amount) =>
  sendRequest({ url: `/api/budgets/${categoryId}`, method: 'put', body: { amount } })

export const removeBudget = (categoryId) =>
  sendRequest({ url: `/api/budgets/${categoryId}`, method: 'delete' })
