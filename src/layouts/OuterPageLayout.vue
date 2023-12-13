<template>
  <div class="page-container">
    <header class="page-title text-app-light font-weight-bold text-center mb-16">
      {{ title }}
    </header>
    <div class="page-subtitle-container d-flex flex-column mb-6">
      <span class="page-subtitle text-app-light mb-1">{{ subtitle }}</span>
      <span class="page-subtitle-description text-app-light">{{ subtitleDescription }}</span>
    </div>

    <slot />

    <slot name="footer" />
  </div>
</template>

<script>
export default {
  name: 'OuterPageLayout',
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String
    },
    subtitleDescription: {
      type: String
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
</style>