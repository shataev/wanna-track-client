<template>
  <v-btn
    variant="outlined"
    rounded="pill"
    color="app-light"
    class="value-button text-none w-100 px-7 justify-space-between mb-2"
    height="56"
  >
    <template #prepend>
      <v-icon :icon="icon" class="mr-2"></v-icon>
      <span class="name">{{ name }}</span>
    </template>
    <template #append>
      <span class="value">$ {{ value }}</span>
    </template>
  </v-btn>
</template>

<script>
export default {
  name: 'AppValueButton',
  props: {
    icon: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  }
}
</script>

<style scoped lang="scss">
.value-button {
  font-size: 20px;
  letter-spacing: -0.18px;
  font-weight: 600;
}
</style>
