<template>
  <header class="d-flex mb-6 align-center">
    <v-btn
      icon="mdi-chevron-left"
      @click="goBack"
      height="35"
      flat=""
      width="35"
      size="x-large"
      color="#FFDF64"
      class="button-back pa-0 text-app-green-lighter"
    ></v-btn>
    <h1 class="flex-grow-1 text-center text-app-light title">Add Expense</h1>
    <LogoIcon></LogoIcon>
  </header>
</template>

<script>
import LogoIcon from '@/components/icons/LogoIcon.vue'

export default {
  name: 'NewExpensePage',
  components: { LogoIcon },
  methods: {
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.title {
  font-size: 30px;
  font-weight: 400;
  line-height: 35px;
  letter-spacing: -0.1804px;
}

.button-back {
  font-size: 23px;
}
</style>
