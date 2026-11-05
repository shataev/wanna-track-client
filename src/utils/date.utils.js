export const getCurrentYear = () => new Date().getFullYear()
export const getCurrentMonth = () => new Date().getMonth()

// The API cuts months on the Asia/Bangkok calendar (UTC+7, no daylight saving), so a month
// built from the browser's clock would disagree with it near a boundary when the owner is
// abroad: the Expenses total, the budgets and Analytics have to cover the same instants.
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000

/**
 * The Bangkok calendar month containing `now`, as the instants the API uses.
 *
 * @param {Date} [now]
 * @returns {[Date, Date]} first millisecond and last millisecond of the month
 */
export const getBangkokMonthRange = (now = new Date()) => {
  const { year, month } = getBangkokYearMonth(now)

  return [
    new Date(Date.UTC(year, month, 1) - BANGKOK_OFFSET_MS),
    new Date(Date.UTC(year, month + 1, 1) - BANGKOK_OFFSET_MS - 1)
  ]
}

/**
 * @param {Date} [date]
 * @returns {{year: number, month: number}} the Bangkok calendar month of the instant, month 0-11
 */
export const getBangkokYearMonth = (date = new Date()) => {
  const shifted = new Date(date.getTime() + BANGKOK_OFFSET_MS)

  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() }
}

/**
 * The Bangkok month `year`/`month` (0-11), as the instants the API uses.
 *
 * @returns {[Date, Date]}
 */
export const getBangkokMonthRangeFor = (year, month) =>
  getBangkokMonthRange(new Date(Date.UTC(year, month, 15)))

/**
 * @param {Array<Date|string>} dates - the selected period
 * @param {Date} [now]
 * @returns {boolean} true when the period is exactly the current Bangkok month
 */
export const isCurrentBangkokMonth = (dates, now = new Date()) => {
  if (!Array.isArray(dates) || dates.length < 2) {
    return false
  }

  const [from, to] = getBangkokMonthRange(now)

  return new Date(dates[0]).getTime() === from.getTime() && new Date(dates[1]).getTime() === to.getTime()
}

/**
 * @param {Date} [now]
 * @returns {string} 'YYYY-MM' of the Bangkok month before the one containing `now`
 */
export const getPreviousBangkokMonthKey = (now = new Date()) => {
  const { year, month } = getBangkokYearMonth(now)
  const previous = new Date(Date.UTC(year, month - 1, 1))

  return `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, '0')}`
}

export const getFirstDayOfCurrentMonth = () => getBangkokMonthRange()[0]

export const getLastDayOfCurrentMonth = () => getBangkokMonthRange()[1]

export const getTodayBeginning = () => {
  const today = new Date()

  today.setHours(0, 0, 0, 0)

  return new Date(today)
}

export const getDayEndByDate = (date) => {
  const newDate = new Date(date)
  newDate.setHours(23, 59, 59, 999)

  return new Date(newDate)
}

export const getTodayEnd = () => getDayEndByDate(new Date())

export const getCurrentDayRange = () => {
  return [getTodayBeginning(), getTodayEnd()]
}

export const getCurrentWeekRange = () => {
  const today = new Date()
  const todayDay = today.getDay()
  const currentWeekFirstDate = today.getDate() - todayDay + 1
  const currentWeekLastDate = today.getDate() + 7 - todayDay

  return [
    new Date(getCurrentYear(), getCurrentMonth(), currentWeekFirstDate),
    new Date(getCurrentYear(), getCurrentMonth(), currentWeekLastDate, 23, 59, 59, 999)
  ]
}

export const getCurrentMonthRange = () => getBangkokMonthRange()

export const getCurrentYearRange = () => {
  const currentYear = new Date().getFullYear()

  const currentYearFirstDate = new Date(currentYear, 0, 1)
  const currentYearLastDate = new Date(currentYear + 1, 0, 1, 0, 0, 0, -1)

  return [currentYearFirstDate, currentYearLastDate]
}
