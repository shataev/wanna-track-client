<template>
  <vue-date-picker
    inline
    :model-value="modelValue"
    @update:model-value="onDateChange"
    class="app-calendar"
    :range="range"
    :auto-apply="autoApply"
    height="48"
    hide-input-icon
    :is-24="false"
    :year-range="[2020, 2040]"
  ></vue-date-picker>
</template>

<script>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
export default {
  name: 'AppCalendar',
  props: {
    modelValue: {
      type: [Date, Array]
    },
    range: Boolean,
    autoApply: {
      type: Boolean,
      default: true
    }
  },
  components: {
    VueDatePicker
  },
  methods: {
    onDateChange(newDate) {
      this.$emit('update:modelValue', newDate)
    }
  }
}
</script>

<style scoped lang="scss">
:deep(.dp__theme_light) {
  --dp-background-color: linear-gradient(180deg, #767a5f 0%, #7d835f 100%);
  --dp-text-color: #f6fdeb;
  --dp-hover-color: #beb260;
  --dp-hover-text-color: white;
  --dp-hover-icon-color: #959595;
  --dp-primary-color: #8e957f;
  --dp-primary-text-color: #f8f5f5;
  --dp-secondary-color: #c0c4cc;
  --dp-border-color: none;
  --dp-menu-border-color: none;
  --dp-border-color-hover: #aaaeb7;
  --dp-disabled-color: #f6f6f6;
  --dp-scroll-bar-background: transparent;
  --dp-scroll-bar-color: #959595;
  --dp-success-color: #76d275;
  --dp-success-color-disabled: #a3d9b1;
  --dp-icon-color: #f6fdeb;
  --dp-danger-color: #ff6f60;
  --dp-highlight-color: rgba(25, 118, 210, 0.1);

  /*General*/
  --dp-font-family: -apple-system, blinkmacsystemfont, 'Segoe UI', roboto, oxygen, ubuntu, cantarell,
    'Open Sans', 'Helvetica Neue', sans-serif;
  --dp-border-radius: 4px; /*Configurable border-radius*/
  --dp-cell-border-radius: 4px; /*Specific border radius for the calendar cell*/
  --dp-common-transition: all 0.1s ease-in; /*Generic transition applied on buttons and calendar cells*/

  /*Sizing*/
  --dp-button-height: 35px; /*Size for buttons in overlays*/
  --dp-month-year-row-height: 35px; /*Height of the month-year select row*/
  --dp-month-year-row-button-size: 35px; /*Specific height for the next/previous buttons*/
  --dp-button-icon-height: 20px; /*Icon sizing in buttons*/
  --dp-cell-size: 35px; /*Width and height of calendar cell*/
  --dp-cell-padding: 5px; /*Padding in the cell*/
  --dp-common-padding: 10px; /*Common padding used*/
  --dp-input-icon-padding: 35px; /*Padding on the left side of the input if icon is present*/
  --dp-input-padding: 6px 30px 6px 12px; /*Padding in the input*/
  --dp-menu-min-width: 100%; /*Adjust the min width of the menu*/
  --dp-action-buttons-padding: 2px 5px; /*Adjust padding for the action buttons in action row*/
  --dp-row-margin: 5px 0; /*Adjust the spacing between rows in the calendar*/
  --dp-calendar-header-cell-padding: 0.5rem; /*Adjust padding in calendar header cells*/
  --dp-two-calendars-spacing: 10px; /*Space between multiple calendars*/
  --dp-overlay-col-padding: 3px; /*Padding in the overlay column*/
  --dp-time-inc-dec-button-size: 32px; /*Sizing for arrow buttons in the time picker*/
  --dp-menu-padding: 6px 8px; /*Menu padding*/

  /*Font sizes*/
  --dp-font-size: 1rem; /*Default font-size*/
  --dp-preview-font-size: 0.8rem; /*Font size of the date preview in the action row*/
  --dp-time-font-size: 0.8rem; /*Font size in the time picker*/

  .dp__button_bottom,
  .dp__button {
    color: var(--dp-icon-color);
    height: var(--dp-button-heigh);
  }

  .dp__overlay {
    width: 100% !important;
  }
}

.app-calendar {
  max-width: 388px;
  justify-content: center;

  :deep(.dp__outer_menu_wrap) {
    width: 100% !important;
  }
}
</style>
