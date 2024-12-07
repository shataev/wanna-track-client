<template>
  <inner-page-layout title="Fund">
    <v-card
      v-if="fund"
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
          <v-btn color="#f2f5e9" @click="editFund" icon="mdi-pencil" />
          <v-btn color="#f2f5e9" @click="editFund" icon="mdi-swap-horizontal" />
          <v-btn color="#f2f5e9" @click="editFund" icon="mdi-delete" />
        </div>
      </template>
    </v-card>
  </inner-page-layout>
</template>

<script setup>
import InnerPageLayout from '@/layouts/InnerPageLayout.vue'
import { onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import sendRequest from '@/api/sendRequest'
import useUserStore from '@/stores/user'

const route = useRoute()
const { user } = useUserStore()
let fund = ref(null)

const fetchFund = async () => {
  const data = await sendRequest({
    url: `/api/funds/${route.params.id}`,
    method: 'get',
    params: {
      userId: user.id
    }
  })

  fund.value = data
}

onBeforeMount(() => {
  fetchFund()
})

const editFund = () => {
  console.log('Edit fund')
}
</script>

<style scoped lang="scss"></style>
