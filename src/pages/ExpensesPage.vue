<template>
  <div class="chart-container position-relative d-flex flex-column overflow-hidden">
    <div class="background-layer position-absolute"></div>
    <header class="chart-header mb-5">
      <v-btn-toggle
        class="filters flex-shrink-0 text-app-light px-10 pt-4 pb-5 justify-space-between h-auto"
        selected-class="filters-button--active"
        variant="plain"
        v-model="currentFilter"
        mandatory
      >
        <v-btn
          v-for="filter in dateFilters"
          :key="filter"
          :ripple="false"
          class="filters-button text-none pa-0"
          min-width="0"
          height="20"
          :value="filter.value"
          >{{ filter.text }}</v-btn
        >
      </v-btn-toggle>
      <h2 class="chart-title text-app-light text-center">{{ chartTitle }}</h2>
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
</template>

<script>
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement } from 'chart.js'

ChartJS.register(ArcElement)

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
    ctx.fillText(`${totalValue}$`, width / 2, (height + top + fontSize) / 2)
  }
}
export default {
  name: 'ExpensesPage',
  components: { Doughnut },
  data() {
    return {
      currentFilter: 'day',
      total: 500,
      dateFilters: [
        {
          text: 'Day',
          value: 'day'
        },
        {
          text: 'Week',
          value: 'week'
        },
        {
          text: 'Month',
          value: 'month'
        },
        {
          text: 'Year',
          value: 'year'
        },
        {
          text: 'Calendar',
          value: 'calendar'
        }
      ],
      chartData: {
        labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
        datasets: [
          {
            backgroundColor: ['#E1D165', '#CAE39D', '#FFDA4C', '#A7C76C'],
            data: [40, 20, 80, 10]
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%'
      },
      chartPlugins: [centerText]
    }
  },
  computed: {
    chartTitle() {
      return this.dateFilters.find((filter) => filter.value === this.currentFilter).text
    }
  }
}
</script>

<style scoped lang="scss">
.chart-container {
  width: 100%;
  height: 420px;
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

.filters {
  display: flex;
}

.chart-title {
  font-size: 28px;
  line-height: 1;
  font-weight: 700;
}

.filters-button {
  font-size: 18px;
  letter-spacing: -0.18px;
  font-weight: 300;

  &--active {
    font-weight: 500;
  }
}
</style>
