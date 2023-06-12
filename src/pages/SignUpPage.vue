<template>
  <auth-layout
    title="Sign Up"
    footer-link-u-r-l="/signin"
    footer-link-text="Sign In"
    footer-text="Already have an account?"
    subtitle-description="Create your account to continue"
    subtitle="Hello!"
  >
    <app-input type="text" name="name" class="mb-3" placeholder="Name"></app-input>
    <app-input type="email" name="email" class="mb-3" placeholder="Email"></app-input>
    <app-input type="text" name="password" class="mb-3" placeholder="Password"></app-input>
    <app-input type="text" name="confirmPassword" placeholder="Confirm Password"></app-input>
    <app-button class="mt-12">Sign Up</app-button>
  </auth-layout>
</template>

<script>
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AuthLayout from '@/components/AuthLayout.vue'

export default {
  name: 'SignUpPage',
  components: { AuthLayout, AppInput, AppButton }
}
</script>

<style scoped></style>
