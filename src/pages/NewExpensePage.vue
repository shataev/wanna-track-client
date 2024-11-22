<template>
  <v-alert
    v-model="alert.isVisible"
    close-text="Close Alert"
    class="alert"
    closable
    :type="alert.type"
    density="compact"
    position="fixed"
    width="100%"
  >
    {{ alert.text }}
  </v-alert>
  <inner-page-layout title="Add Expense">
    <vee-form :validation-schema="validationSchema" @submit="submit">
      <v-form>
        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">Amount</span>
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
          </label>
        </div>

        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column mb-1">
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="label-text">Category </span>
              <div class="add-category-button">
                <v-btn
                  variant="text"
                  :ripple="false"
                  icon="mdi-plus"
                  height="28px"
                  width="28px"
                  @click="() => $router.push('/new-category')"
                ></v-btn>
              </div>
            </div>
            <category-buttons :categories="categories" v-model="category" />
          </label>
        </div>

        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">Date</span>
            <app-datepicker-with-validation
              name="date"
              class-name="form-element form-element-input text-app-light"
              v-model="date"
              :range="false"
              variant="outlined"
              hide-details="auto"
              bg-color="transparent"
            />
          </label>
        </div>

        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">Comment</span>
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
          </label>
        </div>
      </v-form>

      <app-button class="mt-12" type="submit" :loading="request.pending">Save</app-button>
    </vee-form>
  </inner-page-layout>
</template>

<script>
import LogoIcon from '@/components/icons/LogoIcon.vue'
import CategoryButtons from '@/components/CategoryButtons.vue'
import AppButton from '@/components/AppButton.vue'
import AppInputWithValidation from '@/components/AppInputWithValidation.vue'
import sendRequest from '@/api/sendRequest'
import useUserStore from '@/stores/user'
import { mapStores } from 'pinia'
import AppDatepickerWithValidation from '@/components/AppDatepickerWithValidation.vue'
import InnerPageLayout from '@/layouts/InnerPageLayout.vue'

const ALERT_INITIAL_STATE = {
  type: 'success',
  text: '',
  isVisible: false
}

export default {
  name: 'NewExpensePage',
  data() {
    return {
      alert: {
        ...ALERT_INITIAL_STATE
      },
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
      },
      request: {
        pending: false
      }
    }
  },
  components: {
    InnerPageLayout,
    AppDatepickerWithValidation,
    AppInputWithValidation,
    CategoryButtons,
    LogoIcon,
    AppButton
  },
  computed: {
    ...mapStores(useUserStore),
    submitButtonDisabled() {
      return this.request.pending
    }
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    async submit(values, { resetForm }) {
      const { amount, category, comment } = values

      this.request.pending = true

      await sendRequest({
        url: '/api/cost',
        method: 'post',
        body: {
          userId: this.userStore.user.id,
          amount,
          category,
          date: this.date,
          comment
        }
      })

      resetForm()

      this.request.pending = false
      this.alert.text = 'Created!'
      this.alert.isVisible = true

      setTimeout(() => {
        this.alert = { ...ALERT_INITIAL_STATE }
      }, 3000)
    },
    onDateChange(newDate) {
      this.date = newDate
    }
  },
  async beforeMount() {
    const categories = await sendRequest({
      url: '/api/category',
      method: 'get',
      params: {
        userId: this.userStore.user.id
      }
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

.alert {
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}
</style>
