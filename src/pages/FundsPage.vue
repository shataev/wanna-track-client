<template>
  <!--  <div class="chart-container position-relative d-flex flex-column mb-4 pa-6">
    <div class="background-layer position-absolute"></div>
    <Doughnut
      id="my-chart-id"
      :options="chartOptions"
      :plugins="chartPlugins"
      :data="chartData"
      class="position-relative"
    />
  </div>-->
  <div class="funds-total text-center text-white font-weight-medium text-h4 mb-4">
    <template v-if="total">
      {{ total.amount }} {{ totalCurrencySymbol }}
    </template>
    <template v-else>
      0
    </template>
  </div>

  <div class="values">
    <FundCard
      v-for="fund in funds"
      :key="fund._id"
      class="mb-4"
      :fund
      @edit-fund="editFund(fund._id)"
      @delete-fund="deleteFund(fund._id)"
    />
  </div>
</template>

<script>
import chroma from 'chroma-js'
import { Chart as ChartJS, ArcElement } from 'chart.js'
import sendRequest from '@/api/sendRequest'
import useUserStore from '@/stores/user'
import useCurrenciesStore from '@/stores/currencies'
import { mapStores } from 'pinia'
import { getCurrentMonthRange } from '@/utils/date.utils'
import { BUTTON_BACKGROUND_COLORS } from '@/constants/colors.constants'
import FundCard from '@/components/FundCard.vue'
import { ROUTE_NAMES } from '@/router/router.constants'

ChartJS.register(ArcElement)

// TODO: move into plugins
const centerText = {
  id: 'centerText',
  afterDatasetsDraw(chart) {
    const fontSize = 28
    const {
      ctx,
      chartArea: { top, height, width }
    } = chart

    const totalValue = chart.data.datasets[0].data.reduce((acc, current) => {
      return acc + current
    }, 0)

    ctx.save()
    ctx.font = `bold ${fontSize}px Roboto`
    ctx.fillStyle = '#F6FDEB'
    ctx.textAlign = 'center'
    ctx.fillText(`${totalValue} \u0E3F`, width / 2, (height + top + fontSize) / 2)
  }
}

export default {
  name: 'SavingsPage',
  components: { FundCard },
  data() {
    return {
      funds: [],
      total: null,
    }
  },
  computed: {
    ...mapStores(useUserStore),
    currenciesStore() {
      return useCurrenciesStore()
    },
    totalCurrencySymbol() {
      if (!this.total || !this.total.currency) {
        return ''
      }
      const currency = this.currenciesStore.getCurrencyByCode(this.total.currency)
      return currency?.symbol || this.total.currency
    },
    colors() {
      const scale = chroma
        .scale(BUTTON_BACKGROUND_COLORS)
        .mode('lab')
        .domain([0, this.funds.length])
        .correctLightness()

      const colors = scale.colors(this.funds.length)

      return colors
    },
    chartData() {
      const result = {
        labels: [],
        datasets: [
          {
            backgroundColor: this.colors,
            data: []
          }
        ]
      }

      this.funds.map((fund) => {
        result.labels.push(fund.name)
        result.datasets[0].data.push(fund.currentBalance)
      })

      return result
    }
  },
  methods: {
    getButtonBackgroundColor(index) {
      return this.colors[index]
    },
    editFund(fundId) {
      this.$router.push({
        name: ROUTE_NAMES.FUND_EDIT,
        params: {
          id: fundId
        }
      })
    },
    async deleteFund(fundId) {
      await sendRequest({
        url: `/api/funds/${fundId}`,
        method: 'delete',
        params: {
          userId: this.userStore.user.id
        }
      })
    },
    async fetchFunds() {
      const response = await sendRequest({
        url: '/api/funds',
        method: 'get',
        params: {
          userId: this.userStore.user.id
        }
      })

      this.funds = response.funds
      this.total = response.total
    }
  },
  async beforeMount() {
    if (!this.userStore.user.id) {
      return
    }

    await this.fetchFunds()
  }
}
</script>

<style scoped lang="scss">
.date-filter-container {
  z-index: 2;
}

.chart-container {
  width: 100%;
  height: 370px;
  border-radius: 26px;
}

.background-layer {
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border: 2px solid #f6fdeb;
  background: #d4e6b5;
  opacity: 0.2;
  border-radius: 26px;
}
</style>
