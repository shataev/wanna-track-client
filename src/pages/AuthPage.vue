<template>
  <div class="auth-page-container">
    <v-img src="/images/logo.svg" height="150" class="mb-16"></v-img>

    <app-button color="#FFDA4C" to="/signin" class="mb-6">Sign In</app-button>
    <app-button color="#AFC97E" to="/signup">Sign Up</app-button>

    <router-view />
  </div>
</template>

<script>
import AppButton from '@/components/AppButton.vue'

export default {
  name: 'AuthPage',
  components: { AppButton }
}
</script>

<style scoped>
.auth-page-container {
  padding-top: 200px;
}
</style>
