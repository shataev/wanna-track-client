<template>
  <vee-field :name="name" v-slot="{ field, errors }" v-bind="$attrs">
    <app-input-password
      v-if="type === 'password'"
      :name="name"
      v-bind="field"
      class="mb-3"
      :variant="variant"
      :bg-color="bgColor"
      :class="className"
      :placeholder="placeholder"
      :error-messages="errors"
    />
    <app-input
      v-else
      :type="type"
      :name="name"
      v-bind="field"
      class="mb-3"
      :variant="variant"
      :bg-color="bgColor"
      :class="className"
      :placeholder="placeholder"
      :error-messages="errors"
    ></app-input>
  </vee-field>
</template>

<script>
import AppInput from '@/components/AppInput.vue'
import AppInputPassword from '@/components/AppInputPassword.vue'

export default {
  name: 'AppInputWithValidation',
  components: {
    AppInputPassword,
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
    },
    variant: {
      type: String
    },
    bgColor: {
      type: String
      //default: 'app-light'
    },
    className: {
      type: String
    }
  }
}
</script>

<style scoped lang="scss"></style>