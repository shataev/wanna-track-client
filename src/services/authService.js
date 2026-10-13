import http, { SIGN_OUT_URL } from '@/api/http'
import useAuthStore from '@/stores/auth'

/**
 * Revokes this device's session on the API, which also clears the refresh cookie,
 * then forgets the token and the user here. If the API cannot be reached the
 * session stays, and so does the user: a page load would sign them straight back in.
 */
export async function signOut() {
  await http.post(SIGN_OUT_URL)

  useAuthStore().clearSession()
}
