<template>
  <app-input
    v-bind="$attrs"
    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
    :type="showPassword ? 'text' : 'password'"
    @click:append-inner="showPassword = !showPassword"
  >
  </app-input>
</template>

<script>
import AppInput from '@/components/AppInput.vue'

export default {
  name: 'AppInputPassword',
  data() {
    return {
      showPassword: false
    }
  },
  components: { AppInput }
}
</script>

<style scoped lang="scss"></style>