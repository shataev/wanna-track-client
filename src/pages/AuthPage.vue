<template>
  <div class="auth-page-container">
    <v-img src="/images/logo.svg" height="150" class="mb-16"></v-img>
    <v-btn rounded flat to="/signin" block class="mb-6 font-weight-bold text-none" color="#FFDA4C" height="54">Sign In</v-btn>
    <v-btn rounded flat to="/signup" block class="font-weight-bold text-none" color="#AFC97E" height="54">Sign Up</v-btn>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: "AuthPage"
}
</script>

<style scoped>
.auth-page-container {
  padding-top: 200px;
}
</style>
