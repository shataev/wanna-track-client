<template>
  <inner-page-layout title="Transfer Funds">
    <vee-form :validation-schema="validationSchema" @submit="handleSubmit">
      <v-form>
        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">From Fund</span>
            <v-select
              v-model="sourceFund"
              name="sourceFund"
              :items="funds"
              item-title="name"
              item-value="_id"
              class="form-element form-element-input text-app-light"
              variant="outlined"
              hide-details="auto"
              :error-messages="errors.sourceFund"
              @update:model-value="handleSourceFundChange"
            ></v-select>
            <div v-if="selectedSourceFund" class="mt-2 text-app-light text-subtitle-1">
              Available balance: {{ selectedSourceFund.currentBalance }} &#xE3F;
            </div>
          </label>
        </div>

        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">To Fund</span>
            <v-select
              v-model="targetFund"
              name="targetFund"
              :items="availableTargetFunds"
              item-title="name"
              item-value="_id"
              class="form-element form-element-input text-app-light"
              variant="outlined"
              hide-details="auto"
              :error-messages="errors.targetFund"
              @update:model-value="handleTargetFundChange"
            ></v-select>
            <div v-if="selectedTargetFund" class="mt-2 text-app-light text-subtitle-1">
              Current balance: {{ selectedTargetFund.currentBalance }} &#xE3F;
            </div>
          </label>
        </div>

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
              :error-messages="errors.amount"
              @update:model-value="validateAmount"
            ></app-input-with-validation>
            <div v-if="amount && selectedSourceFund" class="mt-2 text-app-light text-subtitle-1">
              Remaining balance: {{ remainingBalance }} &#xE3F;
            </div>
          </label>
        </div>
      </v-form>

      <app-button class="mt-12" type="submit" :loading="loading">Transfer</app-button>
    </vee-form>
  </inner-page-layout>
</template>

<script setup>
import InnerPageLayout from '@/layouts/InnerPageLayout.vue'
import AppInputWithValidation from '@/components/AppInputWithValidation.vue'
import AppButton from '@/components/AppButton.vue'
import { useRequest } from '@/composables/useRequest'
import useUserStore from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onBeforeMount } from 'vue'

const { loading, fetchData } = useRequest()
const router = useRouter()
const { user } = useUserStore()
const route = useRoute()

const sourceFund = ref('')
const targetFund = ref('')
const amount = ref('')
const funds = ref([])
const errors = ref({})

const selectedSourceFund = computed(() => {
  return funds.value.find(fund => fund._id === sourceFund.value)
})

const selectedTargetFund = computed(() => {
  return funds.value.find(fund => fund._id === targetFund.value)
})

const availableTargetFunds = computed(() => {
  return funds.value.filter(fund => fund._id !== sourceFund.value)
})

const remainingBalance = computed(() => {
  if (!selectedSourceFund.value || !amount.value) return 0
  return selectedSourceFund.value.currentBalance - Number(amount.value)
})

const validationSchema = {
  sourceFund: 'required|different:targetFund',
  targetFund: 'required|different:sourceFund',
  amount: 'required|numeric|min_value:1|max_value:3'
}

onBeforeMount(async () => {
  const response = await fetchData({
    url: '/api/funds',
    method: 'get',
    params: {
      userId: user.id
    }
  })

  funds.value = response

  // Set source fund from URL if provided
  if (route.query.sourceFundId) {
    sourceFund.value = route.query.sourceFundId
  }
})

const handleSourceFundChange = () => {
  // Reset target fund if it's the same as source
  if (targetFund.value === sourceFund.value) {
    targetFund.value = ''
  }
  // Reset amount when source fund changes
  amount.value = ''
  validateAmount()
}

const handleTargetFundChange = () => {
  validateAmount()
}

const validateAmount = () => {
  if (!selectedSourceFund.value || !amount.value) return

  const amountNum = Number(amount.value)
  if (amountNum > selectedSourceFund.value.currentBalance) {
    errors.value.amount = 'Amount exceeds available balance'
  } else if (amountNum <= 0) {
    errors.value.amount = 'Amount must be greater than 0'
  } else {
    errors.value.amount = ''
  }
}

const handleSubmit = async () => {
  try {
    // Final validation before submit
    if (!selectedSourceFund.value || !selectedTargetFund.value || !amount.value) {
      return
    }

    const amountNum = Number(amount.value)
    if (amountNum > selectedSourceFund.value.currentBalance) {
      errors.value.amount = 'Amount exceeds available balance'
      return
    }

    await fetchData({
      url: '/api/funds/transfer',
      method: 'post',
      body: {
        userId: user.id,
        sourceFundId: sourceFund.value,
        targetFundId: targetFund.value,
        amount: amountNum
      }
    })

    router.back()
  } catch (error) {
    if (error.response?.data?.error === 'Insufficient funds') {
      errors.value.amount = 'Not enough money in the source fund'
    } else if (error.response?.data?.error === 'Fund not found') {
      errors.value.sourceFund = 'Selected fund was not found'
    } else {
      errors.value.sourceFund = 'Something went wrong. Please try again.'
    }
  }
}
</script>

<style scoped lang="scss">
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