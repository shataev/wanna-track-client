<template>
  <vee-field :name="name" v-slot="{ field, errors }" v-bind="$attrs">
    <app-datepicker v-model="field.value" :name="name" v-bind="$attrs" />
    <v-messages
      transition="none"
      :messages="errors"
      :active="errors?.length > 0"
      color="error"
      style="opacity: 1; padding: 6px 16px 0"
    ></v-messages>
  </vee-field>
</template>

<script>
import AppDatepicker from '@/components/AppDatepicker.vue'

export default {
  name: 'AppDatepickerWithValidation',
  components: {
    AppDatepicker
  },
  props: {
    name: {
      required: true,
      type: String
    }
  }
}
</script>

<style scoped lang="scss"></style>