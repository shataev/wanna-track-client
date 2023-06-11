<template>
  <div class="page-container">
    <header class="page-title text-app-light font-weight-bold text-center mb-16">Sign Up</header>
    <div class="page-subtitle-container text-app-light d-flex flex-column mb-6">
      <span class="page-subtitle mb-1">Hello!</span>
      <span class="page-subtitle-description text-app-light">Create your account to continue</span>
    </div>
    <form class="d-flex flex-column mb-2">
      <app-input type="text" name="name" class="mb-3">Name</app-input>
      <app-input type="email" name="email" class="mb-3">Email</app-input>
      <app-input type="text" name="password" class="mb-3">Password</app-input>
      <app-input type="text" name="confirmPassword">Confirm Password</app-input>
      <app-button class="mt-12">Sign Up</app-button>
    </form>
    <footer class="page-footer text-center">
      Already have an account?
      <router-link to="/signin" class="auth-link text-decoration-none">Sign In</router-link>
    </footer>
  </div>
</template>

<script>
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'

export default {
  name: 'SignUpPage',
  components: { AppInput, AppButton }
}
</script>

<style scoped>
.page-container {
  padding-top: 152px;
}

.page-title {
  font-size: 48px;
}

.page-subtitle {
  font-size: 36px;
  font-weight: 600;
}

.page-subtitle-description {
  font-size: 18px;
}

.page-footer {
  font-size: 16px;
}

.auth-link {
  color: #ffda4c;
}
</style>
