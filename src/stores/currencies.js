import { defineStore } from 'pinia'
import { fetchCurrencies } from '@/services/currenciesService'

// Shared between concurrent callers, so the list is requested only once
// even when a page awaits it before App.vue has finished loading it
let pendingRequest = null

export default defineStore('currencies', {
  state() {
    return {
      currencies: [],
      isLoaded: false
    }
  },
  actions: {
    async fetchCurrencies() {
      if (this.isLoaded) {
        return
      }

      if (!pendingRequest) {
        pendingRequest = fetchCurrencies().finally(() => {
          pendingRequest = null
        })
      }

      try {
        this.currencies = await pendingRequest
        this.isLoaded = true
      } catch (error) {
        console.error('Error fetching currencies:', error)
        throw error
      }
    }
  },
  getters: {
    getCurrencies: (state) => state.currencies,
    getCurrencyByCode: (state) => (code) => {
      return state.currencies.find(currency => currency.code === code)
    },
    // Falls back to the code itself, so an amount is never left bare
    // while the list is still loading
    getSymbolByCode: (state) => (code) => {
      if (!code) {
        return ''
      }

      const currency = state.currencies.find(item => item.code === code)

      return currency?.symbol || code
    }
  }
})

