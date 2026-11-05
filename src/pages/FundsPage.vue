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
      {{ formatAmount(total.amount, total.currency) }} {{ totalCurrencySymbol }}
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
      @archive-fund="askArchive(fund)"
    />
  </div>

  <div v-if="archived.funds.length" class="archive mt-6">
    <v-btn
      variant="text"
      color="#f2f5e9"
      :append-icon="archived.isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
      @click="archived.isOpen = !archived.isOpen"
    >
      Archive ({{ archived.funds.length }})
    </v-btn>

    <v-expand-transition>
      <div v-show="archived.isOpen" class="mt-2">
        <v-card
          v-for="fund in archived.funds"
          :key="fund._id"
          flat
          rounded="xl"
          class="mb-3 text-app-light"
          color="rgb(246 253 235 / 6%)"
        >
          <template v-if="fund.icon" #prepend>
            <v-icon>{{ fund.icon }}</v-icon>
          </template>
          <template #title>
            <div class="d-flex justify-space-between">
              <span>{{ fund.name }}</span>
              <span>{{ formatFundAmount(fund) }}</span>
            </div>
          </template>
          <template #actions>
            <div class="d-flex justify-end w-100">
              <v-btn variant="text" color="#f2f5e9" :disabled="isBusy" @click="restore(fund)">
                Restore
              </v-btn>
              <v-btn variant="text" color="#f2f5e9" :disabled="isBusy" @click="askDelete(fund)">
                Delete
              </v-btn>
            </div>
          </template>
        </v-card>
      </div>
    </v-expand-transition>
  </div>

  <v-snackbar v-model="notice.isOpen" :timeout="6000" color="app-dark">{{ notice.text }}</v-snackbar>

  <v-dialog v-model="confirmation.isOpen" max-width="400">
    <v-card class="pa-4">
      <v-card-title class="px-0 text-wrap">{{ confirmation.title }}</v-card-title>
      <v-card-text class="px-0">{{ confirmation.text }}</v-card-text>
      <v-card-actions class="px-0">
        <v-spacer></v-spacer>
        <v-btn variant="text" :disabled="confirmation.pending" @click="confirmation.isOpen = false">
          Cancel
        </v-btn>
        <v-btn variant="flat" color="app-dark" :loading="confirmation.pending" @click="confirm">
          {{ confirmation.confirmLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import chroma from 'chroma-js'
import { Chart as ChartJS, ArcElement } from 'chart.js'
import {
  archiveFund,
  deleteFund,
  fetchArchivedFunds,
  fetchFunds,
  restoreFund
} from '@/services/fundsService'
import { getFundActionMessage } from '@/utils/fund.utils'
import useUserStore from '@/stores/user'
import useCurrenciesStore from '@/stores/currencies'
import { mapStores } from 'pinia'
import { getCurrentMonthRange } from '@/utils/date.utils'
import { BUTTON_BACKGROUND_COLORS } from '@/constants/colors.constants'
import FundCard from '@/components/FundCard.vue'
import { ROUTE_NAMES } from '@/router/router.constants'
import { formatAmount } from '@/utils/currency.utils'

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
      isBusy: false,
      archived: { funds: [], isOpen: false },
      notice: { isOpen: false, text: '' },
      confirmation: {
        isOpen: false,
        pending: false,
        title: '',
        text: '',
        confirmLabel: '',
        action: null,
        fund: null
      }
    }
  },
  computed: {
    ...mapStores(useUserStore),
    currenciesStore() {
      return useCurrenciesStore()
    },
    totalCurrencySymbol() {
      return this.currenciesStore.getSymbolByCode(this.total?.currency)
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
    formatAmount,
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
    formatFundAmount(fund) {
      const symbol = this.currenciesStore.getSymbolByCode(fund.currency)

      return `${formatAmount(fund.currentBalance, fund.currency)} ${symbol}`.trim()
    },
    showNotice(text) {
      this.notice = { isOpen: true, text }
    },
    askArchive(fund) {
      this.confirmation = {
        isOpen: true,
        pending: false,
        title: `Archive ${fund.name}?`,
        text: 'It leaves your list and your total. Its history and balance are kept, and you can bring it back any time from the Archive below.',
        confirmLabel: 'Archive',
        action: 'archive',
        fund
      }
    },
    askDelete(fund) {
      this.confirmation = {
        isOpen: true,
        pending: false,
        title: `Delete ${fund.name} for good?`,
        text: 'This cannot be undone. An account that has any history cannot be deleted — it stays in the archive.',
        confirmLabel: 'Delete',
        action: 'delete',
        fund
      }
    },
    async confirm() {
      const { action, fund } = this.confirmation
      const run = action === 'archive' ? archiveFund : deleteFund

      this.confirmation.pending = true

      try {
        await run(fund._id)
      } catch (error) {
        this.showNotice(getFundActionMessage(error, action))
      } finally {
        this.confirmation.pending = false
        this.confirmation.isOpen = false
      }

      // Also after a refusal: a 404 or a 409 means the lists on screen are stale
      await this.refresh().catch(() => {})
    },
    async restore(fund) {
      this.isBusy = true

      try {
        await restoreFund(fund._id)
        await this.refresh()
      } catch (error) {
        this.showNotice(getFundActionMessage(error, 'restore'))
      } finally {
        this.isBusy = false
      }
    },
    async refresh() {
      await Promise.all([this.fetchFunds(), this.fetchArchived()])
    },
    async fetchFunds() {
      const response = await fetchFunds()

      this.funds = response.funds
      this.total = response.total
    },
    async fetchArchived() {
      try {
        this.archived.funds = await fetchArchivedFunds()
      } catch {
        // The section is only a convenience; before the API knows it, it stays hidden
        this.archived.funds = []
      }
    }
  },
  async beforeMount() {
    if (!this.userStore.user.id) {
      return
    }

    await this.refresh()
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
