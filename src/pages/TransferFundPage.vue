<template>
  <inner-page-layout title="Transfer Funds">
    <v-form @submit.prevent="handleSubmitForm">
        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">From Fund</span>
              <v-select
                :model-value="sourceFund"
                v-bind="sourceFundAttrs"
                :items="funds"
                item-title="name"
                item-value="_id"
                class="form-element form-element-input text-app-light"
                variant="outlined"
                hide-details="auto"
                :error-messages="errors.sourceFund"
                @update:model-value="setSourceFundValue"
              />
            <div v-if="selectedSourceFund" class="mt-2 text-app-light text-subtitle-1">
              Available balance: {{ selectedSourceFund.currentBalance }} &#xE3F;
            </div>
          </label>
        </div>

        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">To Fund</span>
              <v-select
                :model-value="targetFund"
                v-bind="targetFundAttrs"
                :items="availableTargetFunds"
                item-title="name"
                item-value="_id"
                class="form-element form-element-input text-app-light"
                variant="outlined"
                hide-details="auto"
                :error-messages="errors.targetFund"
                @update:model-value="setFieldValue('targetFund', $event)"
              ></v-select>
            <div v-if="selectedTargetFund" class="mt-2 text-app-light text-subtitle-1">
              Current balance: {{ selectedTargetFund.currentBalance }} &#xE3F;
            </div>
          </label>
        </div>

        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">Amount</span>
              <app-input
                type="number"
                v-bind="amountAttrs"
                v-model="amount"
                placeholder="Enter amount"
                name="amount"
                bg-color="transparent"
                @update:model-value="setFieldValue('amount', $event)"
                class-name="form-element form-element-input text-app-light"
                variant="outlined"
                hide-details="auto"
                :error-messages="errors.amount"
              ></app-input>

            <div v-if="amount && selectedSourceFund" class="mt-2 text-app-light text-subtitle-1">
              Remaining balance: {{ remainingBalance }} &#xE3F;
            </div>
          </label>
        </div>

      <app-button class="mt-12" type="submit" :loading="loading">Transfer</app-button>
    </v-form>
  </inner-page-layout>
</template>

<script setup>
import InnerPageLayout from '@/layouts/InnerPageLayout.vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import { useRequest } from '@/composables/useRequest'
import useUserStore from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onBeforeMount, reactive } from 'vue'
import { useForm } from 'vee-validate'

const { loading, fetchData } = useRequest()
const router = useRouter()
const { user } = useUserStore()
const route = useRoute()

const funds = ref([])

const selectedSourceFund = computed(() => {
  return funds.value.find(fund => fund._id === sourceFund.value);
});

const selectedTargetFund = computed(() => {
  return funds.value.find(fund => fund._id === targetFund.value);
});

const availableTargetFunds = computed(() => {
  return funds.value.filter(fund => fund._id !== sourceFund.value);
});

const remainingBalance = computed(() => {
  if (!selectedSourceFund.value || !amount.value) return 0;
  return selectedSourceFund.value.currentBalance - Number(amount.value);
});

const validationSchema = computed(() => ({
  sourceFund: 'required',
  targetFund: 'required',
  amount: `required|numeric|min_value:1|max_value:${selectedSourceFund.value?.currentBalance ?? 1}`
}));

const { handleSubmit, setFieldValue, errors, defineField, resetForm } = useForm({validationSchema, initialValues: {
  sourceFund: '',
  targetFund: '',
  amount: ''
}});

const [sourceFund, sourceFundAttrs] = defineField('sourceFund');
const [targetFund, targetFundAttrs] = defineField('targetFund');
const [amount, amountAttrs] = defineField('amount');

const setSourceFundValue = (value) => {
  resetForm({ values: {
    sourceFund: value,
    targetFund: '',
    amount: ''
  } });
}

onBeforeMount(async () => {
  const response = await fetchData({
    url: '/api/funds',
    method: 'get',
    params: {
      userId: user.id
    }
  });

  funds.value = response;

  resetForm({ values: {
    sourceFund: route.query.sourceFundId,
    targetFund: '',
    amount: ''
  } });
});

const handleSubmitForm = handleSubmit(async (formData) => {
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
        fromFundId: sourceFund.value,
        toFundId: targetFund.value,
        amount: amountNum,
        description: 'Fund transfer'
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
});

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