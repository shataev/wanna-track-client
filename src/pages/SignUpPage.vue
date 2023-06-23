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
        ></app-input-with-validation>
        <app-input-with-validation
          name="email"
          v-model="email"
          placeholder="Email"
        ></app-input-with-validation>
        <app-input-with-validation
          type="password"
          name="password"
          v-model="password"
          placeholder="Password"
        ></app-input-with-validation>
        <app-input-with-validation
          type="password"
          name="confirmPassword"
          v-model="confirmPassword"
          placeholder="ConfirmPassword"
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
import { axiosInstance } from '@/api/axios'
import AppInputWithValidation from '@/components/AppInputWithValidation.vue'

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
