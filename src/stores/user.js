import { defineStore } from 'pinia'

export default defineStore('user', {
  state() {
    return {
      user: { email: null, id: null, username: null, defaultCurrency: null }
    }
  }
})
