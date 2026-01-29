<template>
  <inner-page-layout title="Profile">
    <div class="profile-content text-app-light">
      <v-card flat rounded="xl" class="mx-auto" color="rgb(246 253 235 / 10%)">
        <v-card-text>
          <p class="mb-2">User profile section</p>
          <p v-if="user" class="text-caption">{{ user.email }}</p>
        </v-card-text>
      </v-card>
    </div>
  </inner-page-layout>
</template>

<script setup>
import InnerPageLayout from '@/layouts/InnerPageLayout.vue'
import { storeToRefs } from 'pinia'
import useUserStore from '@/stores/user'

const { user } = storeToRefs(useUserStore())
</script>

<style scoped lang="scss">
.profile-content {
  padding: 0 1rem;
}
</style>
