<template>
  <v-container fluid class="app-container">
    <v-row>
      <v-col>
        <router-view></router-view>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue'
import useCurrenciesStore from '@/stores/currencies'

const currenciesStore = useCurrenciesStore()

onMounted(async () => {
  await currenciesStore.fetchCurrencies()
})
</script>

<style scoped>
.app-container {
  max-width: 420px;
}
</style>
