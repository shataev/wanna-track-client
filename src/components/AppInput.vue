<template>
  <v-input
    v-bind="$attrs"
    class="app-input bg-app-light rounded-pill text-app-dark"
    hide-details="auto"
  >
    <slot />
  </v-input>
</template>

<script>
export default {
  name: 'AppInput'
}
</script>

<style scoped>
.app-input {
  color: #5f5b53;
  height: 48px;
  font-size: 18px;
  padding: 10px 16px;
}
</style>
