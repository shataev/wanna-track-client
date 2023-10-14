export const checkAccessTokenExpirationDate = (expirationDateInMs) => {
  const dateNow = Date.now()
  const diffInMs = expirationDateInMs - dateNow

  return diffInMs < 5 ? false : true
}
