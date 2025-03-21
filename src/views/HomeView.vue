<template>
  <header class="d-flex mb-6">
    <v-btn
      @click="logout"
      class="bg-app-yellow-lighter"
      color="app-green-lighter"
      icon
      variant="tonal"
      height="37"
      width="37"
      elevation="0"
    >
      <v-icon class="logout-icon"> mdi-logout </v-icon>
    </v-btn>
    <h1 class="flex-grow-1 text-center text-app-light title">Home</h1>
    <v-btn
      icon
      @click="goToAddItem"
      variant="tonal"
      class="bg-app-yellow-lighter"
      height="37"
      width="37"
      color="app-green-lighter"
    >
      <v-icon> mdi-plus </v-icon>
    </v-btn>
  </header>
  <v-btn-toggle
    class="text-none app-tabs bg-app-green-lighter mb-6"
    rounded="pill"
    density="compact"
    v-model="tab"
  >
    <v-btn
      rounded="pill"
      to="/expenses"
      value="expenses"
      class="app-tabs-button text-none text-app-dark"
      :class="tabClass('expenses')"
      >Expenses</v-btn
    >
    <v-btn
      rounded="pill"
      to="/funds"
      value="funds"
      class="app-tabs-button text-none text-app-dark"
      :class="tabClass('funds')"
      >Savings</v-btn
    >
  </v-btn-toggle>
  <router-view />
</template>

<script>
import { ROUTE_NAMES } from '@/router/router.constants'
import sendRequest from '@/api/sendRequest'
import { WANNA_TRACK_ACCESS_TOKEN } from '@/constants'
import useAuthStore from '@/stores/auth'
import { mapStores } from 'pinia'

export default {
  name: 'HomeView',
  data() {
    return {
      tab: 'expenses'
    }
  },
  computed: {
    ...mapStores(useAuthStore)
  },
  methods: {
    tabClass(value) {
      return this.tab === value ? 'bg-app-yellow-lighter' : 'bg-transparent'
    },
    goToAddItem() {
      const routeName = this.tab === 'expenses' ? ROUTE_NAMES.NEW_EXPENSE : ROUTE_NAMES.NEW_FUND
      this.$router.push({ name: routeName })
    },
    async logout() {
      await sendRequest({
        url: '/api/auth/signout',
        method: 'post',
        body: {
          email: this.email,
          password: this.password
        }
      })

      this.authStore.accessToken = null

      localStorage.removeItem(WANNA_TRACK_ACCESS_TOKEN)

      this.$router.push('/')
    }
  }
}
</script>

<style scoped lang="scss">
.title {
  font-size: 30px;
  font-weight: 400;
}

.logout-icon {
  transform: rotateZ(180deg) translateX(2px);
}

.app-tabs {
  display: flex;

  &-button {
    flex-basis: 50%;
    font-size: 18px;
  }
}
</style>
