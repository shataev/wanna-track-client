<template>
  <v-date-picker
    width="100%"
    :value="value"
    @update:modelValue="onChange"
    multiple
    @click:cancel="onCancel"
    :close-on-content-click="true"
  />
</template>

<script>
import { VDatePicker } from 'vuetify/lib/labs/components'
export default {
  name: 'AppDatepicker',
  components: {
    VDatePicker
  },
  props: {
    value: {
      type: Array
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onChange(e) {
      this.$emit('input', e)
    },
    onCancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped lang="scss">
.v-picker {
  color: white;
  background: rgb(164 178 119 / 60%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); // Safari support
}

:deep(.v-picker-title) {
  display: none;
}

:deep(.v-date-picker-header) {
  padding-top: 12px;
}
</style>