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
export default {
  name: 'App'
}
</script>

<style scoped>
.app-container {
  max-width: 420px;
}
</style>
