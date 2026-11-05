<template>
  <v-card
    flat
    rounded="xl"
    class="mx-auto text-app-light"
    :prepend-icon="fund.icon"
    :subtitle="fund.description"
    color="rgb(246 253 235 / 10%)"
  >
    <template #title>
      <div class="d-flex justify-space-between">
        <span>{{ fund.name }}</span>
        <span>{{ formatAmount(fund.currentBalance, fund.currency) }} {{ currencySymbol }}</span>
      </div>
    </template>

    <template v-if="fund.icon" #prepend>
      <v-icon>{{ fund.icon }}</v-icon>
    </template>

    <v-card-text v-if="goal" class="pt-0">
      <v-progress-linear
        :model-value="goal.percent"
        color="#CAE39D"
        bg-color="#F6FDEB"
        bg-opacity="0.2"
        height="8"
        rounded
        aria-label="Goal progress"
      />
      <div class="d-flex justify-space-between flex-wrap mt-2 text-body-2">
        <span>{{ goal.progressText }}</span>
        <span v-if="goal.hintText">{{ goal.hintText }}</span>
      </div>
    </v-card-text>

    <template #actions>
      <div class="d-flex justify-end w-100">
        <v-btn v-if="isSavingsFund" color="#f2f5e9" variant="text" @click="handleTopUp">Top up</v-btn>
        <v-btn color="#f2f5e9" @click="$emit('editFund')" icon="mdi-pencil" />
        <v-btn color="#f2f5e9" @click="handleTransfer" icon="mdi-swap-horizontal" />
        <v-btn color="#f2f5e9" @click="$emit('archiveFund')" icon="mdi-archive-arrow-down" />
      </div>
    </template>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/router/router.constants'
import useCurrenciesStore from '@/stores/currencies'
import { formatAmount } from '@/utils/currency.utils'
import { getGoalDisplay, isSavings } from '@/utils/fund.utils'

const router = useRouter()
const currenciesStore = useCurrenciesStore()

const props = defineProps({
  fund: {}
})

const currencySymbol = computed(() => currenciesStore.getSymbolByCode(props.fund?.currency))

const isSavingsFund = computed(() => isSavings(props.fund))

const goal = computed(() =>
  getGoalDisplay(props.fund, { formatAmount, symbol: currencySymbol.value })
)

const handleTopUp = () => {
  router.push({
    name: ROUTE_NAMES.FUND_TRANSFER,
    query: {
      targetFundId: props.fund._id
    }
  })
}

const handleTransfer = () => {
  router.push({
    name: ROUTE_NAMES.FUND_TRANSFER,
    query: {
      sourceFundId: props.fund._id
    }
  })
}
</script>

<style scoped lang="scss"></style>
