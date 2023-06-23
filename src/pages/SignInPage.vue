<template>
  <auth-layout
    title="Sign In"
    footer-link-u-r-l="/signup"
    footer-link-text="Sign Up"
    footer-text="Don't have an account yet?"
    subtitle-description="Sign in to your account"
    subtitle="Welcome back!"
  >
    <vee-form
      class="d-flex flex-column mb-2"
      :validation-schema="signUpValidationSchema"
      v-slot="{ meta: { touched, valid } }"
    >
      <form class="d-flex flex-column mb-2">
        <app-input-with-validation
          type="email"
          name="email"
          v-model="email"
          class="mb-3"
          placeholder="Email"
        ></app-input-with-validation>
        <app-input-with-validation
          type="text"
          name="password"
          v-model="password"
          class="mb-3"
          placeholder="Password"
        ></app-input-with-validation>

        <app-button class="mt-12" @click="sendSigninData" :disabled="!(touched && valid)">
          Sign In
        </app-button>
      </form>
    </vee-form>
  </auth-layout>
</template>

<script>
import AppButton from '@/components/AppButton.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import AppInputWithValidation from '@/components/AppInputWithValidation.vue'

export default {
  name: 'SignInPage',
  data() {
    return {
      email: '',
      password: ''
    }
  },
  components: { AppInputWithValidation, AuthLayout, AppButton },
  computed: {
    signUpValidationSchema() {
      return {
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
        }
      }
    }
  },
  methods: {
    sendSigninData() {
      console.log(this.email, this.password)
    }
  }
}
</script>

<style scoped></style>
