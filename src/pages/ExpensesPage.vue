<template>
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
    <template v-for="(expense, index) in expenses" :key="expense._id">
      <app-value-button
        :icon="expense.icon"
        :name="expense.category"
        :value="expense.amount"
        :currency="expense.currency"
        :color="expense.color || getButtonBackgroundColor(index)"
        :progress="1"
        @click="toggleCategory(expense._id)"
      >
      </app-value-button>

      <div v-if="expandedCategory === expense._id" class="costs mb-3">
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
            <v-btn
              icon="mdi-tag-edit-outline"
              variant="text"
              size="small"
              color="app-light"
              aria-label="Edit tags"
              @click="openTagEditor(cost)"
            ></v-btn>
          </div>
        </div>
      </div>
    </template>
  </div>

  <v-dialog v-model="tagEditor.isOpen" max-width="400">
    <v-card class="pa-4">
      <v-card-title class="px-0">Tags</v-card-title>
      <v-combobox
        :model-value="tagEditor.tags"
        :items="tagSuggestions"
        placeholder="Add a tag"
        multiple
        chips
        closable-chips
        variant="outlined"
        hide-details="auto"
        :error-messages="tagEditor.error"
        @update:model-value="onTagEditorInput"
      >
        <template #chip="{ props, item }">
          <v-chip v-bind="props" size="small">{{ formatTag(item.raw) }}</v-chip>
        </template>
      </v-combobox>
      <v-card-actions class="px-0 mt-2">
        <v-spacer></v-spacer>
        <v-btn variant="text" :disabled="tagEditor.saving" @click="tagEditor.isOpen = false">Cancel</v-btn>
        <v-btn variant="flat" color="app-yellow-lighter" :loading="tagEditor.saving" @click="saveTags">
          Save
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
import sendRequest from '@/api/sendRequest'
import useUserStore from '@/stores/user'
import useCurrenciesStore from '@/stores/currencies'
import { mapStores } from 'pinia'
import DateFilter from '@/components/DateFilter.vue'
import { getCurrentMonthRange } from '@/utils/date.utils'
import { formatAmount } from '@/utils/currency.utils'
import { BUTTON_BACKGROUND_COLORS } from '@/constants/colors.constants'
import { fetchTags, updateCostTags } from '@/services/tagsService'
import { formatTag, normalizeTags } from '@/utils/tags.utils'

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
  components: { DateFilter, AppValueButton, Doughnut },
  data() {
    return {
      expenses: [],
      dateFilter: {
        periodName: 'month',
        dates: getCurrentMonthRange()
      },
      chartPlugins: [centerText],
      tags: [],
      selectedTag: null,
      expandedCategory: null,
      tagEditor: {
        isOpen: false,
        costId: null,
        tags: [],
        saving: false,
        error: ''
      }
    }
  },
  watch: {
    async 'dateFilter.dates'() {
      await this.fetchExpenses()
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
    openTagEditor(cost) {
      this.tagEditor = {
        isOpen: true,
        costId: cost._id,
        tags: [...(cost.tags || [])],
        saving: false,
        error: ''
      }
    },
    onTagEditorInput(value) {
      this.tagEditor.tags = normalizeTags(value)
    },
    async saveTags() {
      this.tagEditor.saving = true
      this.tagEditor.error = ''

      try {
        await updateCostTags(this.tagEditor.costId, this.tagEditor.tags)
        this.tagEditor.isOpen = false
        await Promise.all([this.fetchExpenses(), this.fetchTags()])
      } catch (error) {
        console.error('[ExpensesPage] update tags', error)
        this.tagEditor.error = 'Could not save the tags. Please try again.'
      } finally {
        this.tagEditor.saving = false
      }
    },
    async fetchTags() {
      // The filter only helps; the breakdown works without it
      try {
        this.tags = await fetchTags()
      } catch (error) {
        console.warn('[ExpensesPage] tags are not available', error)
      }
    },
    getButtonBackgroundColor(index) {
      return this.colors[index]
    },
    onDateFilterInput(value) {
      this.dateFilter = value
    },
    async fetchExpenses() {
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

      this.expenses = expenses
    }
  },
  async beforeMount() {
    if (!this.userStore.user.id) {
      return
    }

    await Promise.all([this.fetchExpenses(), this.fetchTags()])
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
