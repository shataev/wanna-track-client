<template>
  <v-btn
    v-bind="$attrs"
    rounded
    :color="$attrs.color ?? '#FFDA4C'"
    flat
    block
    class="app-button font-weight-bold"
    height="54"
  >
    <slot>Button</slot>
  </v-btn>
</template>

<script>
export default {
  name: 'AppButton'
}
</script>

<style scoped>
.app-button {
  font-size: 24px;
  color: #5f5b53;
}
</style>
