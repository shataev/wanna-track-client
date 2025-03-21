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
        <!--        <v-btn color="#f2f5e9" icon="mdi-swap-horizontal" />-->
        <v-btn color="#f2f5e9" @click="$emit('deleteFund')" icon="mdi-delete" />
      </div>
    </template>
  </v-card>
</template>

<script setup>
defineProps({
  fund: {}
})
const goToEditFund = () => {
  router.push(`${route.fullPath}/edit`)
}
</script>

<style scoped lang="scss"></style>
