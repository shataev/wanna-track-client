<template>
  <div class="datepicker-container" v-bind="$attrs">
    <app-input
      @click="toggleCalendar"
      :value="displayValue"
      :class-name="$attrs['class-name']"
      :variant="variant"
      hide-details="auto"
      readonly
    />
    <v-dialog v-model="showCalendar" content-class="dialog-content-wrapper" scrim="black">
      <app-calendar
        :model-value="modelValue"
        @update:model-value="onDateChange"
        :auto-apply="false"
      />
    </v-dialog>
  </div>
</template>

<script>
import '@vuepic/vue-datepicker/dist/main.css'
import AppInput from '@/components/AppInput.vue'
import AppCalendar from '@/components/AppCalendar.vue'

export default {
  name: 'AppDatepicker',
  components: {
    AppCalendar,
    AppInput
  },
  props: {
    name: {
      type: String
    },
    modelValue: {
      type: Date
    },
    input: {
      type: Boolean,
      default: true
    },
    variant: {
      type: String,
      default: 'outline'
    }
  },
  data() {
    return {
      showCalendar: false
    }
  },
  computed: {
    displayValue() {
      return (
        this.modelValue &&
        this.modelValue.toLocaleString('en-US', {
          hour12: true,
          dateStyle: 'short',
          timeStyle: 'short'
        })
      )
    }
  },
  methods: {
    toggleCalendar() {
      this.showCalendar = !this.showCalendar
    },
    onDateChange(newDate) {
      this.toggleCalendar()
      this.$emit('update:modelValue', newDate)
    }
  }
}
</script>

<style scoped lang="scss">
:deep(.dialog-content-wrapper) {
  align-items: center;
  justify-content: center;
}
</style>
