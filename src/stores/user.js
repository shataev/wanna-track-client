import { defineStore } from 'pinia'

export default defineStore('user', {
  state() {
    return {
      user: {
        email: null,
        id: null,
        username: null,
        defaultCurrency: null,
        telegramId: null,
        verified: null
      }
    }
  },
  actions: {
    setUser({ id, username, email, defaultCurrency, telegramId, verified }) {
      this.user = {
        email: email ?? null,
        id: id ?? null,
        username: username ?? null,
        defaultCurrency: defaultCurrency ?? null,
        telegramId: telegramId ?? null,
        verified: verified ?? null
      }
    }
  }
})
