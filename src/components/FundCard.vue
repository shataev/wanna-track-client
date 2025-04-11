<template>
  <v-card
    flat
    rounded="xl"
    class="mx-auto text-app-light"
    :prepend-icon="fund.icon"
    :subtitle="fund.description"
    color="rgb(246 253 235 / 10%)"
  >
    <template #title>
      <div class="d-flex justify-space-between">
        <span>{{ fund.name }}</span>
        <span>{{ fund.currentBalance }} &#xE3F;</span>
      </div>
    </template>

    <template v-if="fund.icon" #prepend>
      <v-icon>{{ fund.icon }}</v-icon>
    </template>

    <template #actions>
      <div class="d-flex justify-end w-100">
        <v-btn color="#f2f5e9" @click="$emit('editFund')" icon="mdi-pencil" />
        <v-btn color="#f2f5e9" @click="handleTransfer" icon="mdi-swap-horizontal" />
        <v-btn color="#f2f5e9" @click="$emit('deleteFund')" icon="mdi-delete" />
      </div>
    </template>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/router/router.constants'

const router = useRouter()
const props = defineProps({
  fund: {}
})

const handleTransfer = () => {
  router.push({
    name: ROUTE_NAMES.FUND_TRANSFER,
    query: {
      sourceFundId: props.fund._id
    }
  })
}
</script>

<style scoped lang="scss"></style>
