import { defineStore } from 'pinia'
import useUserStore from '@/stores/user'

// The access token is kept in memory only; a page load gets a new one
// from POST /api/auth/refresh using the httpOnly refresh cookie
export default defineStore('auth', {
  state() {
    return {
      accessToken: null
    }
  },
  actions: {
    // Refresh answers { accessToken, user }; signin and signup put the
    // user fields next to accessToken
    setSession(data) {
      this.accessToken = data.accessToken
      useUserStore().setUser(data.user ?? data)
    },
    clearSession() {
      this.accessToken = null
      useUserStore().$reset()
    }
  }
})
