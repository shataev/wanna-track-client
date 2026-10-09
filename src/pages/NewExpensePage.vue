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
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">Source fund</span>
            <v-select
              v-model="sourceFund"
              name="sourceFund"
              :items="funds"
              item-title="name"
              item-value="_id"
              class="form-element form-element-input text-app-light"
              variant="outlined"
              hide-details="auto"
              bg-color="transparent"
            ></v-select>
          </label>
        </div>

        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">Currency</span>
            <v-select
              v-model="currency"
              name="currency"
              :items="currencyItems"
              :loading="!currenciesStore.isLoaded"
              class="form-element form-element-input text-app-light"
              variant="outlined"
              hide-details="auto"
              bg-color="transparent"
            ></v-select>
          </label>
          <div v-if="fundDebit" class="mt-2 text-app-light text-subtitle-1">
            <template v-if="fundDebit.fundAmount !== null">
              {{ selectedFund.name }} will be debited
              {{ formatWithSymbol(fundDebit.fundAmount, selectedFund.currency) }}
            </template>
            <template v-else>
              No exchange rate for {{ currency }} &rarr; {{ selectedFund.currency }} to preview the debit
            </template>
          </div>
        </div>

        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">Tags</span>
            <v-combobox
              :model-value="tags"
              :items="tagSuggestions"
              placeholder="Add a tag"
              multiple
              chips
              closable-chips
              class="form-element form-element-input form-element-tags text-app-light"
              variant="outlined"
              hide-details="auto"
              bg-color="transparent"
              @update:model-value="onTagsInput"
            >
              <template #chip="{ props, item }">
                <v-chip v-bind="props" color="app-light" size="small">#{{ item.raw }}</v-chip>
              </template>
            </v-combobox>
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
            <category-buttons :categories="categories" v-model="category" :key="categoryKey" />
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
import AppDatepickerWithValidation from '@/components/AppDatepickerWithValidation.vue'
import InnerPageLayout from '@/layouts/InnerPageLayout.vue'
import { mapStores } from 'pinia'
import useUserStore from '@/stores/user'
import useCurrenciesStore from '@/stores/currencies'
import { fetchTags } from '@/services/tagsService'
import { normalizeTags } from '@/utils/tags.utils'
import { buildCostRequestBody, getFundDebit } from '@/utils/expense.utils'
import { formatAmount } from '@/utils/currency.utils'

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
      categoryKey: Date.now(),
      amount: null,
      category: null,
      date: new Date(),
      comment: '',
      sourceFund: null,
      funds: [],
      currency: null,
      tags: [],
      tagSuggestions: [],
      rates: null,
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
    ...mapStores(useUserStore, useCurrenciesStore),
    selectedFund() {
      return this.funds.find((fund) => fund._id === this.sourceFund) ?? null
    },
    // The currency the expense is booked in when the user picks nothing else
    defaultCurrency() {
      return this.selectedFund?.currency || this.userStore.user.defaultCurrency
    },
    currencyItems() {
      return this.currenciesStore.getCurrencies.map((item) => ({
        title: `${item.code} ${item.symbol || ''}`.trim(),
        value: item.code
      }))
    },
    fundDebit() {
      return getFundDebit({
        amount: this.amount,
        currency: this.currency,
        fundCurrency: this.selectedFund?.currency,
        rates: this.rates
      })
    },
    submitButtonDisabled() {
      return this.request.pending
    }
  },
  watch: {
    // A new fund brings its own currency; the user can still pick another
    defaultCurrency: {
      handler(currency) {
        this.currency = currency || null
      },
      immediate: true
    }
  },
  methods: {
    formatWithSymbol(amount, currencyCode) {
      return `${formatAmount(amount, currencyCode)} ${this.currenciesStore.getSymbolByCode(currencyCode)}`.trim()
    },
    onTagsInput(value) {
      this.tags = normalizeTags(value)
    },
    resetTags() {
      const { activeTag } = this.userStore.user

      this.tags = activeTag ? [activeTag] : []
    },
    goBack() {
      this.$router.back()
    },
    async submit(values, { resetForm }) {
      const { amount, category, comment } = values

      this.request.pending = true

      try {
        await sendRequest({
          url: '/api/cost',
          method: 'post',
          body: buildCostRequestBody({
            amount,
            category,
            date: this.date,
            comment,
            fundId: this.sourceFund,
            currency: this.currency,
            tags: this.tags
          })
        })

        resetForm();
        this.categoryKey = Date.now();
        this.currency = this.defaultCurrency || null
        this.resetTags()
        this.alert = {
          type: 'success',
          text: 'Created!',
          isVisible: true
        }
      } catch (error) {      
        if (error.response) {
          const { error: errorMessage } = error.response.data
          
          if (errorMessage === 'Fund not found') {
            this.alert = {
              type: 'error',
              text: 'Selected fund was not found. Please try again.',
              isVisible: true
            }
          } else if (errorMessage === 'Insufficient funds') {
            this.alert = {
              type: 'error',
              text: 'Insufficient funds in the selected account. Please choose another fund or reduce the amount.',
              isVisible: true
            }
          } else if (errorMessage?.startsWith('Exchange rate not found')) {
            this.alert = {
              type: 'error',
              text: `No exchange rate for ${this.currency}. Please choose another currency.`,
              isVisible: true
            }
          } else {
            this.alert = {
              type: 'error',
              text: 'An error occurred while creating the expense. Please try again.',
              isVisible: true
            }
          }
        } else {
          this.alert = {
            type: 'error',
            text: 'Network error. Please check your connection and try again.',
            isVisible: true
          }
        }
      } finally {
        this.request.pending = false
        setTimeout(() => {
          this.alert = { ...ALERT_INITIAL_STATE }
        }, 5000)
      }
    },
    onDateChange(newDate) {
      this.date = newDate
    }
  },
  async beforeMount() {
    this.resetTags()

    // Suggestions and the debit preview only help; the page works without them
    fetchTags()
      .then((tags) => {
        this.tagSuggestions = tags.map(({ tag }) => tag)
      })
      .catch((error) => console.warn('[NewExpensePage] tags are not available', error))
    sendRequest({ url: '/api/exchange-rates/current', method: 'get' })
      .then((rates) => {
        this.rates = rates
      })
      .catch((error) => console.warn('[NewExpensePage] exchange rates are not available', error))

    const [categories, fundsResponse] = await Promise.all([
      sendRequest({
        url: '/api/category',
        method: 'get'
      }),
      sendRequest({
        url: '/api/funds',
        method: 'get'
      })
    ])

    this.categories = categories
    this.funds = [
      { _id: null, name: 'No fund', isDefault: false },
      ...fundsResponse.funds
    ]
    
    // Set default fund if exists
    const defaultFund = this.funds.find(fund => fund.isDefault)
    
    if (defaultFund) {
      this.sourceFund = defaultFund._id
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

:deep(.form-element-tags .v-field__input) {
  flex-wrap: wrap;
  gap: 4px;
}

.alert {
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}
</style>
