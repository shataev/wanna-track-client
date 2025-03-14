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

  <div class="values">
    <!--    <app-value-button
      v-for="(fund, index) in funds"
      :key="fund.category"
      :icon="fund.icon ?? ''"
      :name="fund.name"
      :value="fund.currentBalance"
      :color="fund.color || getButtonBackgroundColor(index)"
      :progress="1"
      @click="goToFundDetails(`${fund['_id']}`)"
    >
    </app-value-button>-->
    <FundCard
      v-for="fund in funds"
      :fund
      @edit-fund="editFund(fund._id)"
      @delete-fund="deleteFund(fund._id)"
    />
  </div>
</template>

<script>
import { Doughnut } from 'vue-chartjs'
import chroma from 'chroma-js'
import { Chart as ChartJS, ArcElement } from 'chart.js'
import AppValueButton from '@/components/AppValueButton.vue'
import sendRequest from '@/api/sendRequest'
import useUserStore from '@/stores/user'
import { mapStores } from 'pinia'
import { getCurrentMonthRange } from '@/utils/date.utils'
import { BUTTON_BACKGROUND_COLORS } from '@/constants/colors.constants'
import FundCard from '@/components/FundCard.vue'
import router from '@/router'
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
  components: { FundCard, AppValueButton, Doughnut },
  data() {
    return {
      funds: [],
      dateFilter: {
        periodName: 'month',
        dates: getCurrentMonthRange()
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%'
      },
      chartPlugins: [centerText]
    }
  },
  watch: {
    async 'dateFilter.dates'() {
      await this.fetchExpenses()
    }
  },
  computed: {
    ...mapStores(useUserStore),
    total() {
      return this.funds.reduce((acc, fund) => acc + fund.currentBalance, 0)
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
    deleteFund(fundId) {},
    async fetchFunds() {
      const funds = await sendRequest({
        url: '/api/funds',
        method: 'get',
        params: {
          userId: this.userStore.user.id
        }
      })

      this.funds = funds
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
