<template>
  <vee-field v-bind="$attrs" name="category" v-slot="{ field, errors }">
    <v-radio-group
      name="category"
      class="form-element form-element-radio-group bg-transparent text-app-light"
      inline
      variant="outlined"
      hide-details="auto"
      v-bind="field"
      :error-messages="errors"
      height="286px"
    >
      <v-radio
        v-for="category in categories"
        :label="category.name"
        :key="category.value"
        :true-icon="category.icon"
        :false-icon="category.icon"
        :value="category.value"
        class="flex-column"
      ></v-radio>
    </v-radio-group>
  </vee-field>
</template>

<script>
export default {
  name: 'CategoryButtons',
  props: {
    categories: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped lang="scss">
:deep() {
  .v-input__control {
    border: 1px solid #f6fdeb;
    border-radius: 26px !important;
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .v-selection-control-group {
    height: 286px;
    overflow: auto;
  }

  .v-selection-control {
    flex-basis: 25%;
    margin-top: 14px;

    &:nth-child(-n + 4) {
      margin-top: 0;
    }

    &:nth-child(3n + 1) {
      color: #f6fdeb;
    }

    &:nth-child(3n + 2) {
      color: #ffda4c;
    }

    &:nth-child(3n + 3) {
      color: #cae39d;
    }

    .v-label {
      font-size: 14px;
    }

    .v-icon:before {
      font-size: 42px;
    }
  }

  .v-input__details {
    padding-inline-start: 16px;
    padding-inline-end: 16px;
  }
}
</style>
