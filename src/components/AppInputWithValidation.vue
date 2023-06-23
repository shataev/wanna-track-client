<template>
  <vee-field :name="name" v-slot="{ field, errors }" v-bind="$attrs">
    <app-input
      :type="type"
      :name="name"
      v-bind="field"
      class="mb-3"
      :placeholder="placeholder"
      :error-messages="errors"
    ></app-input>
  </vee-field>
</template>

<script>
import AppInput from '@/components/AppInput.vue'

export default {
  name: 'AppInputWithValidation',
  components: {
    AppInput
  },
  props: {
    name: {
      required: true,
      type: String
    },
    placeholder: {
      type: String
    },
    type: {
      type: String,
      default: 'text'
    }
  }
}
</script>

<style scoped lang="scss"></style>
