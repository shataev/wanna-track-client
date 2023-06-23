<template>
  <v-text-field
    v-bind="$attrs"
    class="rounded-pill text-app-dark"
    variant="solo"
    bg-color="app-light"
    flat
    rounded="pill"
    density="comfortable"
    hide-details="auto"
    validate-on="input"
  >
  </v-text-field>
</template>

<script>
export default {
  name: 'AppInput'
}
</script>

<style scoped lang="scss">
:deep(input) {
  color: #5f5b53 !important;
}
</style>
