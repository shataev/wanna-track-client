<template>
  <header class="d-flex mb-6">
    <h1 class="flex-grow-1 text-center text-app-light title">Home</h1>
    <v-btn
      icon="$plus"
      variant="tonal"
      class="bg-app-yellow-lighter"
      height="37"
      width="37"
      color="app-dark"
    ></v-btn>
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
      to="/income"
      value="income"
      class="app-tabs-button text-none text-app-dark"
      :class="tabClass('income')"
      >Income</v-btn
    >
  </v-btn-toggle>
  <router-view />
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      tab: 'expenses'
    }
  },
  methods: {
    tabClass(value) {
      return this.tab === value ? 'bg-app-yellow-lighter' : 'bg-transparent'
    }
  }
}
</script>

<style scoped lang="scss">
.title {
  font-size: 30px;
  font-weight: 400;
}

.app-tabs {
  display: flex;

  &-button {
    flex-basis: 50%;
    font-size: 18px;
  }
}
</style>
