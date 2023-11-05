import { defineStore } from 'pinia'
import { getUserByAccessTokenFromLocalStorage } from '@/utils/auth.utils'

const user = await getUserByAccessTokenFromLocalStorage()
export default defineStore('user', {
  state() {
    return {
      user: user || { email: null, id: null, username: null }
    }
  }
})
