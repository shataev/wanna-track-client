<template>
  <div class="date-filter">
    <v-btn-toggle
      class="filters flex-shrink-0 text-app-light px-10 pt-4 pb-4 justify-space-between h-auto"
      selected-class="filters-button--active"
      variant="plain"
      :model-value="value.periodName"
      @update:model-value="onDateFilterTypeChange"
    >
      <template v-for="filter in dateFilters" :key="filter">
        <v-btn
          :ripple="false"
          class="filters-button text-none pa-0"
          min-width="0"
          height="20"
          :value="filter.periodName"
          >{{ filter.text }}</v-btn
        >
      </template>
    </v-btn-toggle>
    <h2 class="text-app-light text-center date-filter-display-value" @click="toggleCalendar">
      {{ displayValue }}
    </h2>

    <v-dialog v-model="showCalendar" content-class="dialog-content-wrapper" scrim="black">
      <app-calendar
        :model-value="calendarModelValue"
        v-bind="calendarConfigByPeriodName"
        @update:model-value="onCalendarChange"
      />
    </v-dialog>
  </div>
</template>

<script>
import {
  getCurrentDayRange,
  getCurrentMonthRange,
  getCurrentWeekRange,
  getCurrentYearRange,
  getDayEndByDate
} from '@/utils/date.utils'

import AppCalendar from '@/components/AppCalendar.vue'

export default {
  name: 'DateFilter',
  components: { AppCalendar },
  props: {
    value: {
      periodName: String,
      dates: Array
    }
  },
  data() {
    return {
      showCalendar: false,
      dateFilters: [
        {
          text: 'Day',
          periodName: 'day',
          calendarConfig: {
            range: false
          }
        },
        {
          text: 'Week',
          periodName: 'week',
          calendarConfig: {
            range: false,
            weekPicker: true
          }
        },
        {
          text: 'Month',
          periodName: 'month',
          calendarConfig: {
            range: false,
            monthPicker: true
          }
        },
        {
          text: 'Year',
          periodName: 'year',
          calendarConfig: {
            range: false,
            yearPicker: true
          }
        },
        {
          text: 'Calendar',
          periodName: 'calendar',
          calendarConfig: {
            range: true
          }
        }
      ]
    }
  },
  computed: {
    calendarConfigByPeriodName() {
      const currentDateFilter = this.dateFilters.find(
        (dateFilter) => dateFilter.periodName === this.value.periodName
      )

      return currentDateFilter.calendarConfig
    },
    calendarModelValue() {
      if (['day', 'month', 'year'].includes(this.value.periodName)) {
        return this.value.dates[0]
      }

      return this.value.dates
    },
    displayValue() {
      if (this.value.periodName === 'day') {
        return this.value.dates[0].toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }

      if (this.value.periodName === 'month') {
        return this.value.dates[0].toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        })
      }

      if (this.value.periodName === 'year') {
        return this.value.dates[0].toLocaleDateString('en-US', {
          year: 'numeric'
        })
      }

      return this.value.dates.map((date) => date.toLocaleDateString()).join(' - ')
    }
  },
  methods: {
    setFilterDatesByPeriodName(periodName) {
      let dates = []

      switch (periodName) {
        case 'day':
          dates = getCurrentDayRange()
          break
        case 'week':
          dates = getCurrentWeekRange()
          break
        case 'year':
          dates = getCurrentYearRange()
          break
        case 'month':
          dates = getCurrentMonthRange()
          break
        default:
          dates = getCurrentMonthRange()
          break
      }

      return dates
    },
    onDateFilterTypeChange(periodName) {
      const newValue = {
        periodName: periodName,
        dates: this.setFilterDatesByPeriodName(periodName)
      }

      this.$emit('update:model-value', newValue)
    },
    toggleCalendar() {
      this.showCalendar = !this.showCalendar
    },
    onCalendarChange(value) {
      this.toggleCalendar()

      const newValue = { ...this.value }

      if (newValue.periodName === 'day') {
        const date = value

        newValue.dates = [date, getDayEndByDate(date)]
      } else if (newValue.periodName === 'month') {
        const dateFrom = new Date(value.year, value.month)
        const dateTo = new Date(value.year, value.month + 1, 1, 0, 0, 0, -1)

        newValue.dates = [dateFrom, dateTo]
      } else if (newValue.periodName === 'year') {
        const dateFrom = new Date(value, 0)
        const dateTo = new Date(value + 1, 0, 1, 0, 0, 0, -1)

        newValue.dates = [dateFrom, dateTo]
      } else {
        newValue.dates = value
      }

      this.$emit('update:model-value', newValue)
    }
  }
}
</script>

<style scoped lang="scss">
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

:deep(.dialog-content-wrapper) {
  align-items: center;
  justify-content: center;
}

.filters-button--active {
  opacity: 1;
}

.date-filter-display-value {
  font-size: 18px;
}
</style>
