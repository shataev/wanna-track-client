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
      @click="$attrs.onClick"
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

<style scoped lang="scss">
.form-label {
  font-weight: 400;
  font-size: 24px;
  line-height: 28px;
  letter-spacing: -0.1804px;
}

:deep(.v-input) {
  .v-field__input,
  .v-text-field__prefix {
    padding-top: 9px;
    padding-bottom: 9px;
    min-height: 48px;
    font-size: 18px;
  }
  /*
  There is an issue with border radius of outlined text-field
  So I have to remove default border
  and set my own
   */
  .v-field__outline {
    border: 1px solid #f6fdeb;
    border-radius: 26px !important;

    .v-field__outline__start,
    .v-field__outline__end {
      border: none !important;
    }
  }
}
</style>
