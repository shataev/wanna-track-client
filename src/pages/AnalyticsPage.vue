<template>
  <div class="analytics text-app-light">
    <section class="panel position-relative mb-4">
      <div class="background-layer position-absolute"></div>
      <header class="position-relative date-filter-container">
        <date-filter :value="dateFilter" @update:model-value="onDateFilterInput" />
      </header>

      <div class="position-relative px-5 pb-5">
        <v-progress-linear v-if="isSummaryLoading && !summary" indeterminate color="app-light" />

        <div v-else-if="summaryError" class="empty text-center">{{ summaryError }}</div>

        <template v-else-if="summary">
          <div class="summary-total text-center">{{ formatWithSymbol(summary.total) }}</div>
          <div class="summary-details text-center mb-3">
            {{ summary.count }} {{ summary.count === 1 ? 'expense' : 'expenses' }} ·
            {{ formatWithSymbol(summary.avgPerDay) }} a day
          </div>

          <div class="summary-row d-flex justify-space-between">
            <span>vs {{ previousRange }}</span>
            <span :style="{ color: getDeltaColor(summary.total, summary.previous.total) }">
              {{ formatSignedAmount(totalChange.diff, summary.currency) }}
              <template v-if="totalChange.direction !== 'flat'">
                ({{ formatDelta(summary.total, summary.previous.total) }})
              </template>
            </span>
          </div>

          <div
            v-if="summary.projection !== null && summary.projection !== undefined"
            class="summary-row d-flex justify-space-between"
          >
            <span>Projected by {{ formatDate(summary.period.dateTo) }}</span>
            <span>{{ formatWithSymbol(summary.projection) }}</span>
          </div>
        </template>
      </div>
    </section>

    <section class="mb-6">
      <h3 class="section-title mb-2">Categories</h3>
      <div v-if="isPeriodEmpty" class="empty">No expenses in this period</div>
      <template v-else-if="summary">
        <button
          v-for="(category, index) in summary.categories"
          :key="category.id"
          type="button"
          class="category-row position-relative overflow-hidden d-flex align-center w-100 mb-2 px-5"
          @click="openCategory(category)"
        >
          <span
            class="category-share-bar position-absolute"
            :style="{
              background: `linear-gradient(90deg, ${categoryColors[index]}, transparent)`,
              width: `${getShare(category) * 100}%`
            }"
          ></span>
          <v-icon :icon="category.icon" class="position-relative mr-2"></v-icon>
          <span class="position-relative flex-grow-1 text-left category-name">
            {{ category.name }}
            <span class="category-share">{{ formatPercent(getShare(category) * 100) }}</span>
          </span>
          <span class="position-relative text-right flex-shrink-0 ml-2">
            <span class="d-block category-total">{{ formatWithSymbol(category.total) }}</span>
            <span
              class="d-block category-delta"
              :style="{ color: getDeltaColor(category.total, category.previousTotal) }"
            >
              {{ formatDelta(category.total, category.previousTotal) }}
            </span>
          </span>
        </button>
      </template>
    </section>

    <section class="mb-6">
      <h3 class="section-title mb-2">Last 12 months</h3>
      <v-progress-linear v-if="isMonthlyLoading" indeterminate color="app-light" />
      <div v-else-if="monthlyError" class="empty">{{ monthlyError }}</div>
      <div v-else-if="!trendSeries.length" class="empty">No expenses in this period</div>
      <div v-else class="trend-chart">
        <Bar :data="trendChartData" :options="trendChartOptions" />
      </div>
    </section>

    <section class="mb-6">
      <h3 class="section-title mb-2">Largest expenses</h3>
      <div v-if="isPeriodEmpty" class="empty">No expenses in this period</div>
      <div v-else-if="summary" class="list">
        <div
          v-for="cost in summary.top"
          :key="cost.id"
          class="list-item d-flex justify-space-between align-start"
        >
          <div class="list-item-description">
            <div>
              <v-icon :icon="cost.category?.icon" size="small" class="mr-1"></v-icon>
              {{ cost.category?.name }}
            </div>
            <div class="list-item-meta">
              {{ formatDate(cost.date)
              }}<template v-if="cost.comment"> · {{ cost.comment }}</template>
            </div>
          </div>
          <div class="list-item-amount text-right flex-shrink-0 ml-3">
            <div>{{ formatAmount(cost.amount, cost.currency) }} {{ cost.currency }}</div>
            <div v-if="cost.currency !== summary.currency" class="list-item-meta">
              ≈ {{ formatWithSymbol(cost.amountInUserCurrency) }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-6">
      <h3 class="section-title mb-2">By account</h3>
      <div v-if="isPeriodEmpty" class="empty">No expenses in this period</div>
      <div v-else-if="summary" class="list">
        <div
          v-for="fund in summary.funds"
          :key="fund.id ?? 'none'"
          class="list-item d-flex justify-space-between"
        >
          <span>
            <v-icon icon="mdi-wallet-outline" size="small" class="mr-1"></v-icon>
            {{ fund.name || 'No account' }}
          </span>
          <span class="list-item-amount flex-shrink-0 ml-3">{{
            formatWithSymbol(fund.total)
          }}</span>
        </div>
      </div>
    </section>

    <section class="mb-6">
      <h3 class="section-title mb-2">By tag</h3>
      <div v-if="isPeriodEmpty" class="empty">No expenses in this period</div>
      <div v-else-if="summary && !summary.tags.length" class="empty">
        No tagged expenses in this period
      </div>
      <div v-else-if="summary" class="list">
        <div
          v-for="tag in summary.tags"
          :key="tag.tag"
          class="list-item d-flex justify-space-between"
        >
          <span class="list-item-description">
            {{ formatTag(tag.tag) }}
            <span class="list-item-meta">· {{ tag.count }}</span>
          </span>
          <span class="list-item-amount flex-shrink-0 ml-3">{{ formatWithSymbol(tag.total) }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs'
import chroma from 'chroma-js'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Legend, Tooltip } from 'chart.js'
import { mapStores } from 'pinia'
import DateFilter from '@/components/DateFilter.vue'
import useCurrenciesStore from '@/stores/currencies'
import { BUTTON_BACKGROUND_COLORS } from '@/constants/colors.constants'
import { ROUTE_NAMES } from '@/router/router.constants'
import { getCurrentMonthRange } from '@/utils/date.utils'
import { formatAmount } from '@/utils/currency.utils'
import { formatTag } from '@/utils/tags.utils'
import {
  OTHER_CATEGORY_ID,
  buildTrendSeries,
  formatDelta,
  formatMonthLabel,
  formatPercent,
  formatPeriodRange,
  formatSignedAmount,
  fromPeriodQuery,
  getChange,
  getDeltaColor,
  getMonthRange,
  toPeriodQuery
} from '@/utils/analytics.utils'
import { fetchAnalyticsMonthly, fetchAnalyticsSummary } from '@/services/analyticsService'

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip)

const LIGHT = '#F6FDEB'
const OTHER_COLOR = 'rgba(246, 253, 235, 0.45)'
const GRID_COLOR = 'rgba(246, 253, 235, 0.15)'

const getColors = (count) =>
  chroma
    .scale(BUTTON_BACKGROUND_COLORS)
    .mode('lab')
    .domain([0, count])
    .correctLightness()
    .colors(count)

export default {
  name: 'AnalyticsPage',
  components: { Bar, DateFilter },
  data() {
    return {
      // Arriving from a link keeps its period; otherwise the current month, like Expenses
      dateFilter: fromPeriodQuery(this.$route.query) ?? {
        periodName: 'month',
        dates: getCurrentMonthRange()
      },
      summary: null,
      isSummaryLoading: false,
      summaryError: '',
      monthly: null,
      isMonthlyLoading: false,
      monthlyError: '',
      // Only the response to the latest request may fill the page
      summaryRequestId: 0
    }
  },
  watch: {
    async 'dateFilter.dates'() {
      await this.fetchSummary()
    }
  },
  computed: {
    ...mapStores(useCurrenciesStore),
    isPeriodEmpty() {
      return Boolean(this.summary) && !this.summary.count
    },
    previousRange() {
      return formatPeriodRange(this.summary.previous.dateFrom, this.summary.previous.dateTo)
    },
    totalChange() {
      return getChange(this.summary.total, this.summary.previous.total)
    },
    categoryColors() {
      return getColors(this.summary?.categories.length ?? 0)
    },
    trendSeries() {
      return buildTrendSeries(this.monthly?.months)
    },
    trendChartData() {
      const colors = getColors(this.trendSeries.length)

      return {
        labels: this.monthly.months.map(({ month }) => formatMonthLabel(month)),
        datasets: this.trendSeries.map(({ id, name, data }, index) => ({
          label: name,
          data,
          backgroundColor: id === OTHER_CATEGORY_ID ? OTHER_COLOR : colors[index],
          borderRadius: 4
        }))
      }
    },
    trendChartOptions() {
      const currency = this.monthly?.currency

      return {
        responsive: true,
        maintainAspectRatio: false,
        // A tap anywhere in a month's column counts, not only on a bar
        interaction: { mode: 'index', intersect: false },
        onClick: (event, elements, chart) => {
          const [element] = chart.getElementsAtEventForMode(
            event,
            'index',
            { intersect: false },
            false
          )

          if (element) {
            this.selectMonth(this.monthly.months[element.index].month)
          }
        },
        scales: {
          x: { stacked: true, ticks: { color: LIGHT }, grid: { display: false } },
          y: {
            stacked: true,
            ticks: { color: LIGHT, callback: (value) => formatAmount(value, currency) },
            grid: { color: GRID_COLOR }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: LIGHT, boxWidth: 12, boxHeight: 12 }
          },
          tooltip: {
            callbacks: {
              label: ({ dataset, raw }) =>
                `${dataset.label}: ${this.formatWithSymbol(raw, currency)}`
            }
          }
        }
      }
    }
  },
  methods: {
    formatAmount,
    formatDelta,
    formatPercent,
    formatSignedAmount,
    formatTag,
    getDeltaColor,
    formatWithSymbol(amount, currencyCode = this.summary?.currency) {
      return `${formatAmount(amount, currencyCode)} ${this.currenciesStore.getSymbolByCode(
        currencyCode
      )}`.trim()
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    },
    // Taken from the totals rather than the API's `share`, so the bars always add up to the total shown
    getShare(category) {
      return this.summary.total ? category.total / this.summary.total : 0
    },
    onDateFilterInput(value) {
      this.dateFilter = value
    },
    selectMonth(month) {
      const dates = getMonthRange(month)

      if (dates) {
        this.dateFilter = { periodName: 'month', dates }
      }
    },
    openCategory(category) {
      this.$router.push({
        name: ROUTE_NAMES.EXPENSES,
        query: { ...toPeriodQuery(this.dateFilter), category: category.id }
      })
    },
    async fetchSummary() {
      const requestId = ++this.summaryRequestId

      this.isSummaryLoading = true
      this.summaryError = ''

      try {
        const summary = await fetchAnalyticsSummary(this.dateFilter.dates)

        // The period changed while this was in flight; a newer request owns the page
        if (requestId !== this.summaryRequestId) {
          return
        }

        this.summary = summary
      } catch (error) {
        if (requestId !== this.summaryRequestId) {
          return
        }

        console.error('[AnalyticsPage] summary', error)
        this.summary = null
        this.summaryError =
          error?.response?.status === 400
            ? 'This period is too long to analyse. Pick a shorter one.'
            : 'Could not load the analytics. Please try again.'
      } finally {
        if (requestId === this.summaryRequestId) {
          this.isSummaryLoading = false
        }
      }
    },
    async fetchMonthly() {
      this.isMonthlyLoading = true
      this.monthlyError = ''

      try {
        this.monthly = await fetchAnalyticsMonthly(12)
      } catch (error) {
        console.error('[AnalyticsPage] monthly', error)
        this.monthlyError = 'Could not load the monthly trend.'
      } finally {
        this.isMonthlyLoading = false
      }
    }
  },
  async beforeMount() {
    await Promise.all([this.fetchSummary(), this.fetchMonthly()])
  }
}
</script>

<style scoped lang="scss">
.panel {
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

.date-filter-container {
  z-index: 2;
}

.summary-total {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  word-break: break-word;
}

.summary-details {
  font-size: 15px;
  opacity: 0.9;
}

.summary-row {
  font-size: 15px;
  gap: 12px;
  padding: 6px 0;
  border-top: 1px solid rgba(246, 253, 235, 0.3);
}

.section-title {
  font-size: 20px;
  font-weight: 500;
}

.empty {
  font-size: 15px;
  opacity: 0.8;
}

.category-row {
  min-height: 56px;
  border: 1px solid #f6fdeb;
  border-radius: 28px;
  color: inherit;
  padding-top: 6px;
  padding-bottom: 6px;
}

.category-share-bar {
  top: 0;
  bottom: 0;
  left: 0;
}

.category-name {
  font-size: 18px;
  font-weight: 600;
  word-break: break-word;
}

.category-share {
  font-size: 13px;
  font-weight: 400;
  opacity: 0.85;
}

.category-total {
  font-size: 17px;
  font-weight: 600;
}

.category-delta {
  font-size: 13px;
  font-weight: 500;
}

.trend-chart {
  height: 320px;
}

.list {
  border: 1px solid #f6fdeb;
  border-radius: 26px;
  padding: 4px 16px;
}

.list-item {
  padding: 10px 0;
  font-size: 15px;

  & + & {
    border-top: 1px solid rgba(246, 253, 235, 0.3);
  }
}

.list-item-description {
  word-break: break-word;
}

.list-item-meta {
  font-size: 13px;
  opacity: 0.8;
}

.list-item-amount {
  font-weight: 600;
}
</style>
