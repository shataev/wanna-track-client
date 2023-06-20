<template>
  <auth-layout
    title="Sign Up"
    footer-link-u-r-l="/signin"
    footer-link-text="Sign In"
    footer-text="Already have an account?"
    subtitle-description="Create your account to continue"
    subtitle="Hello!"
  >
    <app-input type="text" name="name" v-model="name" class="mb-3" placeholder="Name"></app-input>
    <app-input
      type="email"
      name="email"
      v-model="email"
      class="mb-3"
      placeholder="Email"
    ></app-input>
    <app-input
      type="text"
      name="password"
      v-model="password"
      class="mb-3"
      placeholder="Password"
    ></app-input>
    <app-input
      type="text"
      name="confirmPassword"
      v-model="confirmPassword"
      placeholder="Confirm Password"
    ></app-input>
    <app-button class="mt-12" @click="sendData">Sign Up</app-button>
  </auth-layout>
</template>

<script>
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import { axiosInstance } from '@/api/axios'

export default {
  name: 'SignUpPage',
  data() {
    return {
      name: null,
      email: null,
      password: null,
      confirmPassword: null
    }
  },
  components: { AuthLayout, AppInput, AppButton },
  methods: {
    async sendData(event) {
      event.preventDefault()
      try {
        const response = await axiosInstance.post('/api/auth/signup', {
          username: this.name,
          email: this.email,
          password: this.password
        })

        const { username, id, email, accessToken } = response.data

        console.log(username, id, email, accessToken)

        //await this.$router.push('/cost')
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>

<style scoped></style>
