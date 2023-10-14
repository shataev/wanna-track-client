<template>
  <v-container fluid class="app-container">
    <v-row>
      <v-col>
        <router-view></router-view>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import sendRequest from '@/api/sendRequest'
import { mapStores } from 'pinia'
import useAuthStore from '@/stores/auth'
import { checkAccessTokenExpirationDate } from '@/utils/checkAccessTokenExpirationDate'
import { WANNA_TRACK_ACCESS_TOKEN } from '@/constants'
export default {
  name: 'App',
  computed: {
    ...mapStores(useAuthStore)
  },
  async beforeMount() {
    const accessToken = this.authStore.accessToken
    const self = this

    if (!accessToken) {
      return
    }

    const isAccessTokenExpired = checkAccessTokenExpirationDate(accessToken.expirationDate)

    if (isAccessTokenExpired) {
      const silentAuth = await sendRequest({
        url: '/api/auth/',
        method: 'get',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        // TODO make it common to all requests
        onUnauthorizedHandler() {
          self.authStore.accessToken = null
          self.authStore.expirationDate = null
          localStorage.removeItem(WANNA_TRACK_ACCESS_TOKEN)
        }
      })

      console.log('[App] silentAuth', silentAuth)
    }

    console.log('[App] accessToken', accessToken)
  }
}
</script>

<style scoped>
.app-container {
  max-width: 420px;
}
</style>
