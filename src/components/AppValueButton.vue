<template>
  <v-btn
    variant="outlined"
    rounded="pill"
    color="app-light"
    class="value-button text-none w-100 px-7 justify-space-between mb-2 position-relative"
    height="56"
  >
    <div class="progress-layout" :style="progressLayoutStyles"></div>
    <template #prepend>
      <v-icon :icon="icon" class="mr-2"></v-icon>
      <span class="name">{{ name }}</span>
    </template>
    <template #append>
      <span class="value">$ {{ value }}</span>
    </template>
  </v-btn>
</template>

<script>
export default {
  name: 'AppValueButton',
  props: {
    icon: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    color: {
      type: String,
      required: true,
      default: '#333'
    },
    progress: {
      type: Number,
      required: true
    }
  },
  computed: {
    progressLayoutStyles() {
      return {
        background: `linear-gradient(90deg, ${this.color}, transparent)`,
        width: `${this.progress * 100}%`
      }
    }
  }
}
</script>

<style scoped lang="scss">
:deep(.v-btn__prepend, .v-btn__append) {
  z-index: 1;
}

.value-button {
  font-size: 20px;
  letter-spacing: -0.18px;
  font-weight: 600;
}

.progress-layout {
  position: absolute;
  top: 1px;
  bottom: 1px;
  left: 1px;
  border-radius: 28px;
  z-index: 0;
}
</style>
