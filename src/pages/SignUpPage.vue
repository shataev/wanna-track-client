<template>
  <auth-layout
    title="Sign Up"
    footer-link-u-r-l="/signin"
    footer-link-text="Sign In"
    footer-text="Already have an account?"
    subtitle-description="Create your account to continue"
    subtitle="Hello!"
  >
    <vee-form
      class="d-flex flex-column mb-2"
      :validation-schema="signUpValidationSchema"
      v-slot="{ meta: { touched, valid } }"
    >
      <v-form>
        <app-input-with-validation
          name="name"
          v-model="name"
          placeholder="Name"
          class-name="text-app-dark"
        ></app-input-with-validation>
        <app-input-with-validation
          name="email"
          v-model="email"
          placeholder="Email"
          class-name="text-app-dark"
        ></app-input-with-validation>
        <app-input-with-validation
          type="password"
          name="password"
          v-model="password"
          placeholder="Password"
          class-name="text-app-dark"
        ></app-input-with-validation>
        <app-input-with-validation
          type="password"
          name="confirmPassword"
          v-model="confirmPassword"
          placeholder="ConfirmPassword"
          class-name="text-app-dark"
        ></app-input-with-validation>

        <app-button class="mt-12" @click="sendData" :disabled="!(touched && valid)">
          Sign Up
        </app-button>
      </v-form>
    </vee-form>
  </auth-layout>
</template>

<script>
import AppButton from '@/components/AppButton.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import AppInputWithValidation from '@/components/AppInputWithValidation.vue'
import sendRequest from '@/api/sendRequest'
import { mapStores } from 'pinia'
import useAuthStore from '@/stores/auth'
import { WANNA_TRACK_ACCESS_TOKEN } from '@/constants'

export default {
  name: 'SignUpPage',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  },
  computed: {
    ...mapStores(useAuthStore),
    signUpValidationSchema() {
      return {
        name: {
          required: true,
          min: 3,
          max: 100
        },
        email: {
          required: true,
          email: true,
          min: 7,
          max: 100
        },
        password: {
          required: true,
          min: 6,
          max: 20
        },
        confirmPassword: {
          required: true,
          is: this.password
        }
      }
    }
  },
  components: { AppInputWithValidation, AuthLayout, AppButton },
  methods: {
    async sendData(event) {
      event.preventDefault()

      const data = await sendRequest({
        url: '/api/auth/signup',
        method: 'post',
        body: {
          username: this.name,
          email: this.email,
          password: this.password
        }
      })

      console.log(data)

      this.authStore.accessToken = data.accessToken

      localStorage.setItem(WANNA_TRACK_ACCESS_TOKEN, data.accessToken)

      this.$router.push('/expenses')
    }
  }
}
</script>

<style scoped></style>
