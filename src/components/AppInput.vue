<template>
  <v-text-field
    v-bind="$attrs"
    :class="className"
    :variant="variant"
    flat
    rounded="pill"
    density="comfortable"
    hide-details="auto"
  >
  </v-text-field>
</template>

<script>
export default {
  name: 'AppInput',
  props: {
    variant: {
      type: String,
      default: 'solo'
    },
    className: {
      type: String
    }
  }
}
</script>

<style scoped lang="scss">
:deep() {
  .v-field--variant-solo,
  .v-field--variant-solo-filled {
    color: #5f5b53 !important;
  }

  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type='number'] {
    -moz-appearance: textfield;
  }
}
</style>
