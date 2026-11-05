<template>
  <v-btn
    variant="outlined"
    rounded="pill"
    color="app-light"
    class="value-button text-none w-100 px-7 justify-space-between mb-2 position-relative overflow-hidden"
    height="56"
  >
    <div class="progress-layout" :style="progressLayoutStyles"></div>
    <div v-if="limitBar" class="limit-track" aria-hidden="true">
      <div class="limit-fill" :style="limitStripStyles.fill"></div>
      <div class="limit-tick" :style="limitStripStyles.tick"></div>
    </div>
    <template #prepend>
      <v-icon :icon="icon" class="mr-2"></v-icon>
      <span class="name">{{ name }}</span>
    </template>
    <template #append>
      <span class="value">{{ formattedValue }}</span>
    </template>
  </v-btn>
</template>

<script>
import { mapStores } from 'pinia'
import useCurrenciesStore from '@/stores/currencies'
import { formatAmount } from '@/utils/currency.utils'
import { getLimitStripStyles } from '@/utils/budget.utils'

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
    currency: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      required: true,
      default: '#333'
    },
    progress: {
      type: Number,
      required: true
    },
    // Replaces the amount, e.g. "2 140 / 3 000 ฿" for a category with a limit
    valueText: {
      type: String,
      default: ''
    },
    // The category's limit as a slim strip along the bottom of the pill:
    // { fill: 0..1 of the limit spent, pace: 0..1 of the month gone, color }; none when null
    limitBar: {
      type: Object,
      default: null
    }
  },
  computed: {
    ...mapStores(useCurrenciesStore),
    formattedValue() {
      if (this.valueText) {
        return this.valueText
      }

      const amount = formatAmount(this.value, this.currency)
      const symbol = this.currenciesStore.getSymbolByCode(this.currency)

      return symbol ? `${amount} ${symbol}` : amount
    },
    progressLayoutStyles() {
      return {
        background: `linear-gradient(90deg, ${this.color}, transparent)`,
        width: `${this.progress * 100}%`
      }
    },
    limitStripStyles() {
      return getLimitStripStyles(this.limitBar)
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

// The limit: a solid strip on a faint track, inside the pill's rounded ends
.limit-track {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 6px;
  height: 5px;
  border-radius: 3px;
  background: rgba(246, 253, 235, 0.2);
  z-index: 1;
  pointer-events: none;
}

.limit-fill {
  height: 100%;
  border-radius: 3px;
}

// Pace: where the month stands, drawn on the strip only
.limit-tick {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 2px;
  margin-left: -1px;
  border-radius: 1px;
  background: #f6fdeb;
  box-shadow: 0 0 0 1px rgba(63, 61, 54, 0.6);
}

.progress-layout {
  position: absolute;
  top: 1px;
  bottom: 1px;
  left: 1px;
  min-width: 52px;
  border-radius: 28px;
  z-index: 0;
}
</style>
