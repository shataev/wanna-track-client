<template>
  <v-alert
    v-model="alert.isVisible"
    close-text="Close Alert"
    class="alert"
    closable
    icon="mdi-alert-circle-outline"
    variant="flat"
    :color="ALERT_COLORS.backgroundColor"
    :style="{ color: ALERT_COLORS.color }"
    density="compact"
    position="fixed"
    width="100%"
  >
    {{ alert.text }}
  </v-alert>
  <v-select
    v-model="selectedTag"
    :items="tagItems"
    placeholder="All expenses"
    prepend-inner-icon="mdi-tag-outline"
    clearable
    class="tag-filter form-element form-element-input text-app-light mb-4"
    variant="outlined"
    hide-details="auto"
    bg-color="transparent"
  ></v-select>

  <div class="chart-container position-relative d-flex flex-column mb-4">
    <div class="background-layer position-absolute"></div>
    <header class="chart-header mb-5 date-filter-container">
      <div v-if="selectedTag" class="tag-header text-app-light text-center px-4 pt-4">
        <div class="tag-header-period">All time</div>
        <h2 class="tag-header-total">
          {{ formatTag(selectedTag) }} · {{ formatWithSymbol(tagTotal.total, tagTotal.currency) }}
        </h2>
        <div v-if="tagTotal.count" class="tag-header-details">
          {{ tagTotal.count }} {{ tagTotal.count === 1 ? 'expense' : 'expenses' }}
          <template v-if="tagTotal.firstDate">
            · {{ formatDate(tagTotal.firstDate) }} – {{ formatDate(tagTotal.lastDate) }}
          </template>
        </div>
      </div>
      <date-filter v-else :value="dateFilter" @update:model-value="onDateFilterInput" />
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
    <template v-for="(expense, index) in categoryRows" :key="expense._id">
      <app-value-button
        :icon="expense.icon"
        :name="expense.category"
        :value="expense.amount"
        :currency="expense.currency"
        :color="getCategoryBar(expense).color || expense.color || getButtonBackgroundColor(index)"
        :progress="getCategoryBar(expense).progress"
        :value-text="getCategoryBar(expense).valueText"
        :pace="getCategoryBar(expense).pace"
        :name-color="getCategoryBar(expense).nameColor"
        @click="toggleCategory(expense._id)"
      >
      </app-value-button>

      <div v-if="expandedCategory === expense._id" class="costs mb-3">
        <div v-if="showBudgets" class="budget-row d-flex align-center text-app-light">
          <div class="budget-row-text flex-grow-1">
            Monthly limit: {{ describeBudgetRow(budgetByCategory[expense._id] ?? null, budgetPeriod, formatWithSymbol) }}
          </div>
          <v-btn
            icon="mdi-pencil-outline"
            variant="text"
            size="small"
            color="app-light"
            aria-label="Set monthly limit"
            @click="openBudgetSheet(expense)"
          ></v-btn>
        </div>
        <div v-for="cost in sortByDateDesc(expense.costs)" :key="cost._id" class="cost text-app-light">
          <div class="d-flex justify-space-between align-start">
            <div class="cost-description">
              <span class="cost-date">{{ formatDate(cost.date) }}</span>
              <span v-if="cost.comment"> · {{ cost.comment }}</span>
              <div v-if="cost.fund?.name" class="cost-fund">
                <v-icon icon="mdi-wallet-outline" size="x-small"></v-icon> {{ cost.fund.name }}
              </div>
            </div>
            <div class="cost-amount text-right flex-shrink-0 ml-3">
              <div>{{ formatAmount(cost.amount, cost.currency) }} {{ cost.currency }}</div>
              <div v-if="cost.currency !== expense.currency" class="cost-converted">
                ≈ {{ formatWithSymbol(cost.amountInUserCurrency, expense.currency) }}
              </div>
            </div>
          </div>
          <div class="d-flex align-center flex-wrap mt-1 cost-tags">
            <v-chip v-for="tag in cost.tags || []" :key="tag" size="small" color="app-light">
              {{ formatTag(tag) }}
            </v-chip>
            <div class="cost-actions d-flex ml-auto">
              <v-btn
                icon="mdi-pencil-outline"
                variant="text"
                size="small"
                color="app-light"
                aria-label="Edit expense"
                @click="editCost(cost)"
              ></v-btn>
              <v-btn
                icon="mdi-trash-can-outline"
                variant="text"
                size="small"
                color="app-light"
                aria-label="Delete expense"
                @click="openDeleteConfirmation(cost)"
              ></v-btn>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <budget-sheet
    v-model="budgetSheet.isOpen"
    :category-name="budgetSheet.categoryName"
    :currency="displayCurrency"
    :symbol="currenciesStore.getSymbolByCode(displayCurrency)"
    :prefill="budgetSheet.prefill"
    :has-limit="Boolean(budgetSheet.categoryId && budgetByCategory[budgetSheet.categoryId])"
    :pending="budgetSheet.pending"
    :failure="budgetSheet.failure"
    @save="saveBudget"
    @remove="deleteBudget"
  />

  <v-dialog v-model="deletion.isOpen" max-width="400">
    <v-card class="pa-4">
      <v-card-text class="px-0">{{ deletion.question }}</v-card-text>
      <v-card-actions class="px-0">
        <v-spacer></v-spacer>
        <v-btn variant="text" :disabled="deletion.pending" @click="deletion.isOpen = false">Cancel</v-btn>
        <v-btn variant="flat" color="app-dark" :loading="deletion.pending" @click="confirmDelete">
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { Doughnut } from 'vue-chartjs'
import chroma from 'chroma-js'
import { Chart as ChartJS, ArcElement } from 'chart.js'
import AppValueButton from '@/components/AppValueButton.vue'
import BudgetSheet from '@/components/BudgetSheet.vue'
import sendRequest from '@/api/sendRequest'
import useUserStore from '@/stores/user'
import useCurrenciesStore from '@/stores/currencies'
import { mapStores } from 'pinia'
import DateFilter from '@/components/DateFilter.vue'
import { getCurrentMonthRange, getPreviousBangkokMonthKey, isCurrentBangkokMonth } from '@/utils/date.utils'
import { formatAmount } from '@/utils/currency.utils'
import { ALERT_COLORS, BUTTON_BACKGROUND_COLORS } from '@/constants/colors.constants'
import { fetchBudgets, removeBudget, setBudget } from '@/services/budgetsService'
import { fetchAnalyticsMonthly } from '@/services/analyticsService'
import {
  describeBudgetRow,
  formatBudgetValue,
  getBudgetBar,
  getBudgetColors,
  getLimitPrefill,
  hasBudgetState,
  withBudgetOnlyCategories
} from '@/utils/budget.utils'
import { fetchTags } from '@/services/tagsService'
import { deleteCost } from '@/services/costService'
import { formatTag } from '@/utils/tags.utils'
import { fromPeriodQuery, toPeriodQuery } from '@/utils/analytics.utils'
import { getDeleteConfirmation, getExpenseErrorMessage } from '@/utils/expense.utils'
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

    // The plugin instance is created once, so the currency has to be read
    // from the options on every draw rather than captured up front
    const { currency = '', symbol = '' } = chart.options.plugins?.centerText ?? {}

    ctx.save()
    ctx.font = `bold ${fontSize}px Roboto`
    ctx.fillStyle = '#F6FDEB'
    ctx.textAlign = 'center'
    ctx.fillText(
      `${formatAmount(totalValue, currency)} ${symbol}`.trim(),
      width / 2,
      (height + top + fontSize) / 2
    )
  }
}

export default {
  name: 'ExpensesPage',
  components: { DateFilter, AppValueButton, BudgetSheet, Doughnut },
  data() {
    return {
      expenses: [],
      // Analytics links here with its period and the category to open
      dateFilter: fromPeriodQuery(this.$route.query) ?? {
        periodName: 'month',
        dates: getCurrentMonthRange()
      },
      chartPlugins: [centerText],
      ALERT_COLORS,
      tags: [],
      // Kept in the query when an expense is edited, so coming back finds the same list
      selectedTag: this.$route.query.tag ?? null,
      expandedCategory: this.$route.query.category ?? null,
      deletion: {
        isOpen: false,
        costId: null,
        question: '',
        pending: false
      },
      // Refusals from the API, shown as the expense form shows them
      alert: {
        isVisible: false,
        text: ''
      },
      // Only the response to the latest request may fill the page
      expensesRequestId: 0,
      // GET /api/budgets for the current Bangkok month; null while loading and when the
      // API does not have budgets, in which case the page looks as it did before them
      budgetsData: null,
      budgetSheet: {
        isOpen: false,
        categoryId: null,
        categoryName: '',
        prefill: '',
        pending: false,
        failure: ''
      }
    }
  },
  watch: {
    async 'dateFilter.dates'() {
      await this.fetchExpenses()
    },
    showBudgets(isShown) {
      if (isShown) {
        this.fetchBudgetData()
      }
    },
    async selectedTag() {
      this.expandedCategory = null
      await this.fetchExpenses()
    }
  },
  computed: {
    ...mapStores(useUserStore, useCurrenciesStore),
    total() {
      return this.expenses.reduce((acc, expense) => acc + expense.amount, 0)
    },
    tagItems() {
      return this.tags.map(({ tag }) => ({ title: formatTag(tag), value: tag }))
    },
    tagSuggestions() {
      return this.tags.map(({ tag }) => tag)
    },
    // /api/tags has the total over all time; the category sums stand in
    // until it has loaded
    tagTotal() {
      const summary = this.tags.find(({ tag }) => tag === this.selectedTag)

      return summary ?? { total: this.total, currency: this.displayCurrency }
    },
    // Limits are for the current month only: a past month would show today's limit
    // against old spending, and a tag looks at all time
    showBudgets() {
      return Boolean(this.budgetsData) && !this.selectedTag && isCurrentBangkokMonth(this.dateFilter.dates)
    },
    // Categories with a limit stay on the page without expenses in the month; the chart
    // and the total keep to the real expenses
    categoryRows() {
      return this.showBudgets
        ? withBudgetOnlyCategories(this.expenses, this.budgetsData.budgets)
        : this.expenses
    },
    budgetByCategory() {
      const byCategory = {}

      for (const budget of this.budgetsData?.budgets ?? []) {
        byCategory[budget.category?.id] = budget
      }

      return byCategory
    },
    budgetPeriod() {
      const { daysInMonth, elapsedDays } = this.budgetsData ?? {}

      return { daysInMonth, elapsedDays }
    },
    // The API converts every category into the user's base currency
    displayCurrency() {
      return this.expenses[0]?.currency || this.userStore.user?.defaultCurrency || ''
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          // Analytics registers the legend plugin globally; the category list
          // below the chart already serves as this chart's legend
          legend: { display: false },
          centerText: {
            currency: this.displayCurrency,
            symbol: this.currenciesStore.getSymbolByCode(this.displayCurrency)
          }
        }
      }
    },
    colors() {
      // Создаем шкалу на основе этих цветов
      const scale = chroma
        .scale(BUTTON_BACKGROUND_COLORS)
        .mode('lab')
        .domain([0, this.expenses.length])
        .correctLightness()

      const colors = scale.colors(this.expenses.length)

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

      this.expenses.map((expense) => {
        result.labels.push(expense.category)
        result.datasets[0].data.push(expense.amount)
      })

      return result
    }
  },
  methods: {
    describeBudgetRow,
    formatAmount,
    formatTag,
    formatWithSymbol(amount, currencyCode) {
      return `${formatAmount(amount, currencyCode)} ${this.currenciesStore.getSymbolByCode(currencyCode)}`.trim()
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    },
    sortByDateDesc(costs = []) {
      return [...costs].sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    toggleCategory(categoryId) {
      this.expandedCategory = this.expandedCategory === categoryId ? null : categoryId
    },
    async editCost(cost) {
      // The way back from the edit page lands on this period, tag and open category
      await this.$router.replace({
        query: {
          ...(this.selectedTag ? { tag: this.selectedTag } : toPeriodQuery(this.dateFilter)),
          ...(this.expandedCategory ? { category: this.expandedCategory } : {})
        }
      })
      this.$router.push({ name: ROUTE_NAMES.EXPENSE_EDIT, params: { id: cost._id } })
    },
    openDeleteConfirmation(cost) {
      this.deletion = {
        isOpen: true,
        costId: cost._id,
        question: getDeleteConfirmation(cost, this.formatWithSymbol),
        pending: false
      }
    },
    async confirmDelete() {
      this.deletion.pending = true

      try {
        await deleteCost(this.deletion.costId)
      } catch (error) {
        console.error('[ExpensesPage] delete expense', error)
        this.alert = { isVisible: true, text: getExpenseErrorMessage(error, { action: 'deleting' }) }
        setTimeout(() => {
          this.alert.isVisible = false
        }, 5000)
      } finally {
        this.deletion.pending = false
        this.deletion.isOpen = false
      }

      // Also after a refusal: an expense already deleted elsewhere leaves the list
      await Promise.all([this.fetchExpenses(), this.fetchTags(), this.fetchBudgetData()])
    },
    async fetchTags() {
      // The filter only helps; the breakdown works without it
      try {
        this.tags = await fetchTags()
      } catch (error) {
        console.warn('[ExpensesPage] tags are not available', error)
      }
    },
    // How a category button looks: today's full bar, or spent / limit with the pace tick
    getCategoryBar(expense) {
      const budget = this.showBudgets ? this.budgetByCategory[expense._id] : null

      if (!hasBudgetState(budget)) {
        return { progress: 1, valueText: '', pace: null, nameColor: '', color: '' }
      }

      const { fill, pace } = getBudgetBar(budget, this.budgetsData.pacePercent)
      const colors = getBudgetColors(budget.state)

      return {
        progress: fill,
        valueText: formatBudgetValue(budget, this.currenciesStore.getSymbolByCode(budget.currency)),
        pace,
        nameColor: colors.color,
        color: colors.backgroundColor
      }
    },
    async fetchBudgetData() {
      this.budgetsData = await fetchBudgets()
    },
    async openBudgetSheet(expense) {
      const budget = this.budgetByCategory[expense._id] ?? null

      this.budgetSheet = {
        isOpen: true,
        categoryId: expense._id,
        categoryName: expense.category,
        prefill: getLimitPrefill(budget, null),
        pending: false,
        failure: ''
      }

      if (!budget) {
        const lastMonthTotal = await this.fetchLastMonthTotal(expense._id)

        // Still the same sheet, and the owner has not changed what it starts with
        if (this.budgetSheet.categoryId === expense._id) {
          this.budgetSheet.prefill = getLimitPrefill(null, lastMonthTotal)
        }
      }
    },
    // Only a starting suggestion: nothing to show when it cannot be had
    async fetchLastMonthTotal(categoryId) {
      try {
        const { months = [] } = await fetchAnalyticsMonthly(2)
        const month = months.find((item) => item.month === getPreviousBangkokMonthKey())

        return month?.categories?.find((category) => category.id === categoryId)?.total ?? null
      } catch (error) {
        console.warn('[ExpensesPage] last month is not available', error)

        return null
      }
    },
    async saveBudget(amount) {
      await this.changeBudget(() => setBudget(this.budgetSheet.categoryId, amount))
    },
    async deleteBudget() {
      await this.changeBudget(async () => {
        try {
          await removeBudget(this.budgetSheet.categoryId)
        } catch (error) {
          // Already removed elsewhere: the goal is reached
          if (error?.response?.status !== 404) {
            throw error
          }
        }
      })
    },
    async changeBudget(request) {
      this.budgetSheet.pending = true
      this.budgetSheet.failure = ''

      try {
        await request()
      } catch (error) {
        console.error('[ExpensesPage] monthly limit', error)
        this.budgetSheet.failure = 'Could not save the limit. Try again.'
        this.budgetSheet.pending = false

        return
      }

      this.budgetSheet.pending = false
      this.budgetSheet.isOpen = false
      await this.fetchBudgetData()
    },
    getButtonBackgroundColor(index) {
      // Rows added for a limit have no slice in the chart, so no colour in its scale
      return this.colors[index] || BUTTON_BACKGROUND_COLORS[0]
    },
    onDateFilterInput(value) {
      this.dateFilter = value
    },
    async fetchExpenses() {
      const requestId = ++this.expensesRequestId

      const expenses = await sendRequest({
        url: '/api/costs',
        method: 'get',
        // With a tag the API takes all time
        params: this.selectedTag
          ? { tag: this.selectedTag }
          : {
              dateFrom: this.dateFilter.dates[0],
              dateTo: this.dateFilter.dates[1]
            }
      })

      // A filter changed while this was in flight; a newer request owns the page
      if (requestId !== this.expensesRequestId) {
        return
      }

      this.expenses = expenses
    }
  },
  async beforeMount() {
    if (!this.userStore.user.id) {
      return
    }

    await Promise.all([this.fetchExpenses(), this.fetchTags(), this.fetchBudgetData()])
  }
}
</script>

<style scoped lang="scss">
.tag-filter :deep(.v-field__outline) {
  border: 1px solid #f6fdeb;
  border-radius: 26px !important;

  .v-field__outline__start,
  .v-field__outline__end {
    border: none !important;
  }
}

.tag-header-period,
.tag-header-details {
  font-size: 14px;
  opacity: 0.9;
}

.tag-header-total {
  font-size: 20px;
  word-break: break-word;
}

.costs {
  border: 1px solid #f6fdeb;
  border-radius: 26px;
  padding: 4px 16px;
}

.budget-row {
  padding: 6px 0;
  font-size: 15px;
  border-bottom: 1px solid rgba(246, 253, 235, 0.3);
}

.budget-row-text {
  word-break: break-word;
}

.cost {
  padding: 10px 0;

  & + & {
    border-top: 1px solid rgba(246, 253, 235, 0.3);
  }
}

.cost-description {
  font-size: 15px;
  word-break: break-word;
}

.cost-fund {
  font-size: 13px;
  opacity: 0.8;
}

.cost-date {
  opacity: 0.8;
}

.cost-amount {
  font-size: 16px;
  font-weight: 600;
}

.cost-converted {
  font-size: 13px;
  font-weight: 400;
  opacity: 0.8;
}

.cost-tags {
  gap: 4px;
}

.cost-actions {
  gap: 4px;
}

.alert {
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

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
