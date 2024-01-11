<template>
  <div class="chart-container position-relative d-flex flex-column mb-4">
    <div class="background-layer position-absolute"></div>
    <header class="chart-header mb-5 date-filter-container">
      <date-filter :value="dateFilter" @update:model-value="onDateFilterInput" />
    </header>

    <div class="chart flex-shrink-1 flex-grow-0">
      <Doughnut
        id="my-chart-id"
        :options="chartOptions"
        :plugins="chartPlugins"
        :data="chartData"
        class="position-relative"
      />
    </div>
  </div>

  <div class="values">
    <app-value-button
      v-for="(expense, index) in expenses"
      :key="expense.category"
      :icon="expense.icon"
      :name="expense.category"
      :value="expense.amount"
      :color="expense.color || getButtonBackgroundColor(index)"
      :progress="expense.amount / total"
    >
    </app-value-button>
  </div>
</template>

<script>
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement } from 'chart.js'
import AppValueButton from '@/components/AppValueButton.vue'
import sendRequest from '@/api/sendRequest'
import useUserStore from '@/stores/user'
import { mapStores } from 'pinia'
import { BUTTON_BACKGROUND_COLORS } from '@/constants/colors.constants'
import DateFilter from '@/components/DateFilter.vue'
import { getCurrentMonthRange } from '@/utils/date.utils'

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
  name: 'ExpensesPage',
  components: { DateFilter, AppValueButton, Doughnut },
  data() {
    return {
      expenses: [],
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
      return this.expenses.reduce((acc, expense) => acc + expense.amount, 0)
    },
    chartData() {
      const result = {
        labels: [],
        datasets: [
          {
            backgroundColor: BUTTON_BACKGROUND_COLORS, //TODO: fill this Array with colors constants
            data: []
          }
        ]
      }

      this.expenses.map((expense) => {
        result.labels.push(expense.category)
        result.datasets[0].data.push(expense.amount)
      })

      return result
    }
  },
  methods: {
    getButtonBackgroundColor(index) {
      return BUTTON_BACKGROUND_COLORS[index]
    },
    onDateFilterInput(value) {
      this.dateFilter = value
    },
    async fetchExpenses() {
      const expenses = await sendRequest({
        url: '/api/costs',
        method: 'get',
        params: {
          userId: this.userStore.user.id,
          dateFrom: this.dateFilter.dates[0],
          dateTo: this.dateFilter.dates[1]
        }
      })

      this.expenses = expenses
    }
  },
  async beforeMount() {
    if (!this.userStore.user.id) {
      return
    }

    await this.fetchExpenses()
  }
}
</script>

<style scoped lang="scss">
.date-filter-container {
  z-index: 2;
}

.chart-container {
  width: 100%;
  height: 450px;
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
