import { defineStore } from 'pinia'
import { WANNA_TRACK_ACCESS_TOKEN } from '@/constants'

export default defineStore('auth', {
  state() {
    return {
      accessToken: localStorage.getItem(WANNA_TRACK_ACCESS_TOKEN) ?? null
    }
  }
})
