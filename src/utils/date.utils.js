export const getCurrentYear = () => new Date().getFullYear()
export const getCurrentMonth = () => new Date().getMonth()

export const getFirstDayOfCurrentMonth = () => {
  const currentYear = getCurrentYear()
  const currentMonth = getCurrentMonth()

  return new Date(currentYear, currentMonth)
}

export const getLastDayOfCurrentMonth = () => {
  const currentYear = getCurrentYear()
  const currentMonth = getCurrentMonth()

  return new Date(currentYear, currentMonth + 1, 1, 0, 0, 0, -1)
}

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

export const getCurrentMonthRange = () => {
  const currentMonthFirstDate = getFirstDayOfCurrentMonth()
  const currentMonthLastDate = getLastDayOfCurrentMonth()

  return [currentMonthFirstDate, currentMonthLastDate]
}

export const getCurrentYearRange = () => {
  const currentYear = new Date().getFullYear()

  const currentYearFirstDate = new Date(currentYear, 0, 1)
  const currentYearLastDate = new Date(currentYear + 1, 0, 1, 0, 0, 0, -1)

  return [currentYearFirstDate, currentYearLastDate]
}
