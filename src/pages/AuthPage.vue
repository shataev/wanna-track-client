<template>
  <h1>
    Auth Page
  </h1>
  <router-link to="/signin">Sign In</router-link>
  <router-link to="/signup">Sign Up</router-link>
  <router-view/>
</template>

<script>
export default {
  name: "AuthPage"
}
</script>

<style scoped>

</style>
