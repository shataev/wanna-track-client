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
  <vee-form :validation-schema="validationSchema" @submit="submit">
    <v-form>
      <div class="form-element-wrapper mb-4">
        <label for="amount" class="form-label text-app-light d-flex mb-1">Amount</label>
        <app-input-with-validation
          type="number"
          placeholder="Enter amount"
          name="amount"
          v-model="amount"
          bg-color="transparent"
          class-name="form-element form-element-input text-app-light"
          variant="outlined"
          hide-details="auto"
        ></app-input-with-validation>
      </div>
      <div class="form-element-wrapper mb-4">
        <label for="categories" class="form-label text-app-light d-flex mb-1">Category</label>
        <category-buttons :categories="categories" v-model="category" />
      </div>
      <div class="form-element-wrapper mb-4">
        <label for="date" class="form-label text-app-light d-flex mb-1">Date</label>
        <app-datepicker v-model="date" name="date"></app-datepicker>
      </div>
      <div class="form-element-wrapper mb-4">
        <label for="comment" class="form-label text-app-light d-flex mb-1">Comment</label>
        <vee-field name="comment" v-slot="{ field, errors }" v-bind="$attrs">
          <v-textarea
            type="text"
            placeholder="Enter comments"
            v-bind="field"
            name="comment"
            class="form-element form-element-textarea bg-transparent text-app-light"
            variant="outlined"
            rows="3"
            hide-details="auto"
            :error-messages="errors"
          ></v-textarea>
        </vee-field>
      </div>
    </v-form>
    <app-button class="mt-12" type="submit">Save</app-button>
  </vee-form>
</template>

<script>
import LogoIcon from '@/components/icons/LogoIcon.vue'
import CategoryButtons from '@/components/CategoryButtons.vue'
import AppDatepicker from '@/components/AppDatepicker.vue'
import AppButton from '@/components/AppButton.vue'
import AppInputWithValidation from '@/components/AppInputWithValidation.vue'
import sendRequest from '@/api/sendRequest'
import useUserStore from '@/stores/user'
import { mapStores } from 'pinia'

// TODO: change with real data
/*const categories = [
  {
    name: 'Shopping',
    value: 2,
    color: '#CAE39D',
    icon: 'mdi-cart'
  },
  {
    name: 'Restaurants',
    value: 1,
    color: '#E1D165',
    icon: 'mdi-noodles'
  },
  {
    name: 'Leisure',
    value: 41,
    color: '#A7C76C',
    icon: 'mdi-controller'
  },
  {
    name: 'Clothes',
    value: 42,
    color: '#A7C76C',
    icon: 'mdi-tshirt-crew'
  },
  {
    name: 'Travel',
    value: 52,
    color: '#A7C76C',
    icon: 'mdi-wallet-travel'
  },
  {
    name: 'Internet',
    value: 53,
    color: '#A7C76C',
    icon: 'mdi-web'
  },
  {
    name: 'Mobile',
    value: 54,
    color: '#A7C76C',
    icon: 'mdi-cellphone'
  },
  {
    name: 'House',
    value: 3,
    color: '#FFDA4C',
    icon: 'mdi-home'
  },
  {
    name: 'Petrol',
    value: 4,
    color: '#A7C76C',
    icon: 'mdi-gas-station'
  },
  {
    name: 'Pets',
    value: 5,
    color: '#CAE39D',
    icon: 'mdi-paw'
  },
  {
    name: 'Service',
    value: 6,
    color: '#FFDA4C',
    icon: 'mdi-car'
  }
]*/

export default {
  name: 'NewExpensePage',
  data() {
    return {
      categories: [],
      amount: null,
      category: null,
      date: new Date(),
      comment: '',
      validationSchema: {
        amount: 'required|min_expense_value:1',
        category: 'required',
        date: 'required',
        comment: 'min:3|max:200'
      }
    }
  },
  components: {
    AppInputWithValidation,
    AppDatepicker,
    CategoryButtons,
    LogoIcon,
    AppButton
  },
  computed: {
    ...mapStores(useUserStore)
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    async submit(values) {
      const { amount, category, date, comment } = values

      await sendRequest({
        url: '/api/cost',
        method: 'post',
        body: {
          userId: this.userStore.user.id,
          amount,
          category,
          date,
          comment
        }
      })
    }
  },
  async beforeMount() {
    const categories = await sendRequest({
      url: '/api/category',
      method: 'get'
    })

    this.categories = categories
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
