<template>
  <v-bottom-sheet :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="budget-sheet px-4 pt-4 pb-6" color="app-dark">
      <h2 class="sheet-title mb-1">Monthly limit · {{ categoryName }}</h2>
      <p class="sheet-hint mb-4">
        In {{ currency }}. It applies to every month and never stops an expense.
      </p>

      <v-text-field
        v-model="amount"
        type="text"
        inputmode="decimal"
        label="Limit"
        :suffix="symbol"
        variant="outlined"
        autofocus
        :error-messages="error"
        hide-details="auto"
        class="mb-4"
        @keyup.enter="save"
      ></v-text-field>

      <div class="d-flex align-center">
        <v-btn
          v-if="hasLimit"
          variant="text"
          color="app-light"
          :disabled="pending"
          @click="$emit('remove')"
        >
          Remove
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn variant="text" color="app-light" :disabled="pending" @click="$emit('update:modelValue', false)">
          Cancel
        </v-btn>
        <v-btn variant="flat" color="app-light" :loading="pending" @click="save">Save</v-btn>
      </div>
      <div v-if="failure" class="sheet-failure mt-3">{{ failure }}</div>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { parseLimit } from '@/utils/budget.utils'

export default {
  name: 'BudgetSheet',
  props: {
    modelValue: { type: Boolean, default: false },
    categoryName: { type: String, default: '' },
    currency: { type: String, default: '' },
    symbol: { type: String, default: '' },
    // What the field starts with each time the sheet opens
    prefill: { type: String, default: '' },
    hasLimit: { type: Boolean, default: false },
    pending: { type: Boolean, default: false },
    // A refusal from the API, shown under the buttons
    failure: { type: String, default: '' }
  },
  emits: ['update:modelValue', 'save', 'remove'],
  data() {
    return { amount: this.prefill, error: '' }
  },
  watch: {
    modelValue(isOpen) {
      if (isOpen) {
        this.amount = this.prefill
        this.error = ''
      }
    },
    // Last month's total can arrive after the sheet has opened
    prefill(value) {
      if (this.modelValue && !this.amount) {
        this.amount = value
      }
    }
  },
  methods: {
    save() {
      const amount = parseLimit(this.amount)

      if (amount === null) {
        this.error = 'Enter an amount above zero'

        return
      }

      this.error = ''
      this.$emit('save', amount)
    }
  }
}
</script>

<style scoped lang="scss">
.budget-sheet {
  color: #f6fdeb;
  border-radius: 26px 26px 0 0;
}

.sheet-title {
  font-size: 20px;
  font-weight: 500;
  word-break: break-word;
}

.budget-sheet :deep(.v-field__input),
.budget-sheet :deep(.v-text-field__suffix) {
  color: #f6fdeb;
  opacity: 1;
}

.sheet-hint {
  font-size: 14px;
  opacity: 0.85;
}

.sheet-failure {
  font-size: 14px;
  color: #f4a261;
}
</style>
