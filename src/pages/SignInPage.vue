<template>
  <auth-layout
    title="Sign In"
    footer-link-u-r-l="/signup"
    footer-link-text="Sign Up"
    footer-text="Don't have an account yet?"
    subtitle-description="Sign in to your account"
    subtitle="Welcome back!"
  >
    <app-input type="email" name="email" class="mb-3" placeholder="Email"></app-input>
    <app-input type="text" name="password" class="mb-3" placeholder="Password"></app-input>
    <app-button class="mt-12">Sign In</app-button>
  </auth-layout>
</template>

<script>
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AuthLayout from '@/components/AuthLayout.vue'

export default {
  name: 'SignInPage',
  components: { AuthLayout, AppInput, AppButton }
}
</script>

<style scoped></style>
