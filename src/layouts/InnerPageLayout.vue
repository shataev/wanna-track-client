<script setup>
import AppHeader from '@/components/AppHeader.vue'

const { title } = defineProps({
  title: String
})
</script>

<template>
  <app-header :title="title" />
  <slot></slot>
</template>

<style scoped></style>
