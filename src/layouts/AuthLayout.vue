<template>
  <outer-page-layout
    :title="title"
    footer-link-u-r-l=""
    footer-link-text=""
    :subtitle-description="subtitleDescription"
    :subtitle="subtitle"
  >
    <slot />

    <template v-slot:footer>
      <footer class="page-footer text-app-light text-center">
        {{ footerText }}
        <router-link :to="footerLinkURL" class="auth-link text-decoration-none text-app-link">
          {{ footerLinkText }}
        </router-link>
      </footer>
    </template>
  </outer-page-layout>
</template>

<script>
import OuterPageLayout from '@/layouts/OuterPageLayout.vue'

export default {
  name: 'AuthLayout',
  components: { OuterPageLayout },
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
.page-footer {
  font-size: 16px;
}
</style>