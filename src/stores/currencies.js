import { defineStore } from 'pinia'
import { fetchCurrencies } from '@/services/currenciesService'

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

      try {
        const data = await fetchCurrencies()
        this.currencies = data
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
    }
  }
})

