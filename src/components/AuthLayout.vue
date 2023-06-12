<template>
  <div class="page-container">
    <header class="page-title text-app-light font-weight-bold text-center mb-16">
      {{ title }}
    </header>
    <div class="page-subtitle-container d-flex flex-column mb-6">
      <span class="page-subtitle text-app-light mb-1">{{ subtitle }}</span>
      <span class="page-subtitle-description text-app-light">{{ subtitleDescription }}</span>
    </div>
    <form class="d-flex flex-column mb-2">
      <slot />
    </form>
    <footer class="page-footer text-app-light text-center">
      {{ footerText }}
      <router-link :to="footerLinkURL" class="auth-link text-decoration-none text-app-link">{{
        footerLinkText
      }}</router-link>
    </footer>
  </div>
</template>

<script>
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'

export default {
  name: 'AuthLayout',
  components: { AppInput, AppButton },
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      required: true
    },
    subtitleDescription: {
      type: String,
      required: true
    },
    footerText: {
      type: String,
      required: true
    },
    footerLinkText: {
      type: String,
      required: true
    },
    footerLinkURL: {
      type: String,
      required: true
    }
  }
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
</style>
