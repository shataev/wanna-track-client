<template>
  <v-btn
    variant="outlined"
    rounded="pill"
    color="app-light"
    class="value-button text-none w-100 px-7 justify-space-between mb-2 position-relative overflow-hidden"
    height="56"
  >
    <div class="progress-layout" :style="progressLayoutStyles"></div>
    <div v-if="pace !== null" class="pace-tick" :style="paceTickStyles" aria-hidden="true"></div>
    <template #prepend>
      <v-icon :icon="icon" class="mr-2" :style="nameStyles"></v-icon>
      <span class="name" :style="nameStyles">{{ name }}</span>
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
    // 0..1: a thin tick where the month stands against the limit; none when null
    pace: {
      type: Number,
      default: null
    },
    // Colour of the icon and name, which sit on the filled part of the bar
    nameColor: {
      type: String,
      default: ''
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
        width: `${this.progress * 100}%`,
        // Nothing spent is an empty bar, not the minimum sliver
        ...(this.progress > 0 ? {} : { minWidth: '0' })
      }
    },
    paceTickStyles() {
      return { left: `calc(${this.pace * 100}% - 1px)` }
    },
    nameStyles() {
      return this.nameColor ? { color: this.nameColor } : {}
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

.pace-tick {
  position: absolute;
  top: 8px;
  bottom: 8px;
  width: 2px;
  border-radius: 1px;
  background: #f6fdeb;
  box-shadow: 0 0 0 1px rgba(63, 61, 54, 0.5);
  z-index: 1;
  pointer-events: none;
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
