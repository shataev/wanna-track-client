<template>
  <outer-page-layout :title="config.title" :subtitle="config.subtitle">
    <div class="text-app-light text-center" v-if="showSignInButton">
      <app-button to="/signin">Sign In</app-button>
    </div>
    <div class="text-app-light text-center" v-if="showGenerateNewEmailVerificationLinkButton">
      <app-button @click="generateNewVerificationLink">Send!</app-button>
    </div>
  </outer-page-layout>
</template>

<script>
import OuterPageLayout from '@/layouts/OuterPageLayout.vue'
import AppButton from '@/components/AppButton.vue'
import sendRequest from '@/api/sendRequest'
import {
  EMAIL_VERIFICATION_PAGE_CONFIG,
  VERIFICATION_EMAIL_STATUS_ALREADY_VERIFIED,
  VERIFICATION_EMAIL_STATUS_EXPIRED,
  VERIFICATION_EMAIL_STATUS_SUCCESS
} from '@/pages/EmailVerificationPage/EmailVerificationPage.constants'
export default {
  name: 'EmailVerificationPage',
  components: { AppButton, OuterPageLayout },
  data() {
    return {
      status: '',
      userId: null,
      config: {}
    }
  },
  computed: {
    showGenerateNewEmailVerificationLinkButton() {
      return this.status === VERIFICATION_EMAIL_STATUS_EXPIRED
    },
    showSignInButton() {
      return [
        VERIFICATION_EMAIL_STATUS_SUCCESS,
        VERIFICATION_EMAIL_STATUS_ALREADY_VERIFIED
      ].includes(this.status)
    }
  },
  methods: {
    async generateNewVerificationLink() {
      const generationStatus = await sendRequest({
        url: '/api/verify/email',
        method: 'post',
        body: {
          userId: this.userId
        }
      })

      // TODO: handle this request and show notofication
      console.log(generationStatus)
    }
  },
  beforeMount() {
    this.status = this.$route.query.status
    this.userId = this.$route.query.userId
    this.config = EMAIL_VERIFICATION_PAGE_CONFIG[this.$route.query.status]
  }
}
</script>

<style scoped></style>