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
  <v-form>
    <div class="form-element-wrapper mb-4">
      <label for="amount" class="form-label text-app-light d-flex mb-1">Amount</label>
      <v-text-field
        type="number"
        name="amount"
        prefix="$"
        class="form-element form-element-input bg-transparent text-app-light"
        variant="outlined"
        hide-details="auto"
      ></v-text-field>
    </div>
    <div class="form-element-wrapper mb-4">
      <label for="amount" class="form-label text-app-light d-flex mb-1">Comment</label>
      <v-textarea
        type="text"
        placeholder="Enter comments"
        name="comment"
        class="form-element form-element-textarea bg-transparent text-app-light"
        variant="outlined"
        hide-details="auto"
      ></v-textarea>
    </div>
  </v-form>
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

<style scoped lang="scss">
$border-raduis-text-field: 999px;

.title {
  font-size: 30px;
  font-weight: 400;
  line-height: 35px;
  letter-spacing: -0.1804px;
}

.button-back {
  font-size: 23px;
}

.form-label {
  font-weight: 400;
  font-size: 24px;
  line-height: 28px;
  letter-spacing: -0.1804px;
}

:deep(.v-input) {
  .v-field__input,
  .v-text-field__prefix {
    padding-top: 9px;
    padding-bottom: 9px;
    min-height: 48px;
    color: #f6fdeb;
    font-size: 18px;
  }
  /*
  There is an issue with border radius of outlined text-field
  So I have to remove default border
  and set my own
   */
  .v-field__outline {
    border: 1px solid #f6fdeb;
    border-radius: 26px !important;

    .v-field__outline__start,
    .v-field__outline__end {
      border: none !important;
    }
  }
}
</style>
