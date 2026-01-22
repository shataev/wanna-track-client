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
          type="password"
          name="password"
          v-model="password"
          class="mb-3"
          placeholder="Password"
        ></app-input-with-validation>

        <app-button class="mt-12" @click.prevent="sendData" :disabled="!(touched && valid)">
          Sign In
        </app-button>
      </form>
    </vee-form>
  </auth-layout>
</template>

<script>
import AppButton from '@/components/AppButton.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppInputWithValidation from '@/components/AppInputWithValidation.vue'
import sendRequest from '@/api/sendRequest'
import { mapStores } from 'pinia'
import useAuthStore from '@/stores/auth'
import useUserStore from '@/stores/user'
import { WANNA_TRACK_ACCESS_TOKEN } from '@/constants'

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
    ...mapStores(useAuthStore, useUserStore),
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
    async sendData() {
      // TODO: add error handling and notificatios
      const {
        accessToken,
        id,
        email,
        username: name,
        defaultCurrency
      } = await sendRequest({
        url: '/api/auth/signin',
        method: 'post',
        body: {
          email: this.email,
          password: this.password
        }
      })

      this.authStore.accessToken = accessToken
      this.userStore.user = {
        id,
        email,
        name,
        defaultCurrency
      }

      localStorage.setItem(WANNA_TRACK_ACCESS_TOKEN, accessToken)

      this.$router.push('/expenses')
    }
  }
}
</script>

<style scoped></style>